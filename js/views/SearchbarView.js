define([
    "jquery",
    "underscore",
    "backbone",
    "openlayers",
    "text!templates/Searchbar.html",
    "text!templates/SearchbarRecommendedList.html",
    "text!templates/SearchbarHitList.html",
    "models/Searchbar",
    "eventbus",
    "config"
    ], function ($, _, Backbone, ol, SearchbarTemplate, SearchbarRecommendedListTemplate, SearchbarHitListTemplate, Searchbar, EventBus, Config) {

        var searchVector = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "#d42132",
                    lineDash: [8],
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: "rgba(215, 215, 215, 0.5)"
                })
            })
        });
        EventBus.trigger("addLayer", searchVector);

        var SearchbarView = Backbone.View.extend({
            "model": Searchbar,
            "id": "searchbar",
            "className": "col-md-5 col-sm-4 col-xs-9",
            "template": _.template(SearchbarTemplate),
            "initialize": function () {
                this.listenTo(this.model, "change:searchString", this.render);
                this.listenTo(this.model, "change:isHitListReady", this.renderRecommendedList);
                this.listenTo(this.model, "change:initString", this.zoomTo);
                this.render();
                $("#searchInput").prop("disabled", "disabled");
                $(window).on("orientationchange", function () {
                    this.render();
                }, this);
            },
            "events": {
                "keyup input": "setSearchString",
                "focusin input": "toggleStyleForRemoveIcon",
                "focusout input": "toggleStyleForRemoveIcon",
                "click .btn-deleteSearch": "deleteSearchString",
                "click .btn-search": "renderHitList",
                "click .list-group-item.hit": "zoomTo",
                "mouseover .list-group-item.hit": "showMarker",
                "mouseleave .list-group-item.hit": "hideMarker",
                "click .list-group-item.type": "collapseHits"
            },

            /**
            *
            */
            "render": function () {
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));
                if (window.innerWidth < 768) {
                    $(".navbar-toggle").before(this.$el); // vor dem toggleButton
                } else {
                    $(".navbar-collapse").append(this.$el); // rechts in der Menuebar
                }
                this.focusOnEnd($("#searchInput"));
                if (this.model.get("searchString").length !== 0) {
                    $("#searchInput:focus").css("border-right-width", "0");
                }
            },

            /**
            *
            */
            "renderRecommendedList": function () {
                if (this.model.get("isHitListReady") === true) {
                    var attr = this.model.toJSON();
                    $("ul.dropdown-menu-search").html(_.template(SearchbarRecommendedListTemplate, attr));
                }
                if (Config.searchBar.initString !== undefined) {   // workaround für die initiale Suche von B-Plänen
                    this.model.set("initString", Config.searchBar.initString);
                }
            },

            /**
            *
            */
            "renderHitList": function () {
                if (this.model.get("isHitListReady") === true) {
                    if (this.model.get("hitList").length <= 2) {
                        var types = _.pluck(this.model.get("hitList"), "type");
                        if (_.contains(types, "Straße") && _.contains(types, "Adresse")) {
                            var hit = _.findWhere(this.model.get("hitList"), {type: "Adresse"});
                            this.model.get("marker").setPosition(hit.coordinate);
                            $("#searchMarker").css("display", "block");
                            $(".dropdown-menu-search").hide();
                            EventBus.trigger("setCenter", hit.coordinate, 7);
                        }
                    }
                    else {
                        this.model.set("typeList", _.uniq(_.pluck(this.model.get("hitList"), "type")));
                        var attr = this.model.toJSON();
                        $("ul.dropdown-menu-search").html(_.template(SearchbarHitListTemplate, attr));
                    }
                }
            },

            /**
            *
            */
            "setSearchString": function (evt) { //console.log(evt.target);
                this.model.setSearchString(evt.target.value); // evt.target.value = Wert aus der Suchmaske
                if (evt.key === "Enter" || evt.keyCode === 13) {
                    if (this.model.get("hitList").length <= 2) {
                        var types = _.pluck(this.model.get("hitList"), "type");
                        if (_.contains(types, "Straße") && _.contains(types, "Adresse")) {
                            var hit = _.findWhere(this.model.get("hitList"), {type: "Adresse"});
                            this.model.get("marker").setPosition(hit.coordinate);
                            $("#searchMarker").css("display", "block");
                            $(".dropdown-menu-search").hide();
                            EventBus.trigger("setCenter", hit.coordinate, 7);
                        }
                    }
                    else {
                        this.renderHitList();
                    }
                }
            },

            /**
            *
            */
            "collapseHits": function (evt) {
                $(".list-group-item.type + div").hide("slow");  // schließt alle Reiter
                if ($(evt.currentTarget.nextElementSibling).css("display") === "block") {
                    $(evt.currentTarget.nextElementSibling).hide("slow");
                }
                else {
                    $(evt.currentTarget.nextElementSibling).show("slow");
                }
            },

            /**
            *
            */
            "toggleStyleForRemoveIcon": function (evt) {
                if (evt.type === "focusin") {
                    $(".btn-deleteSearch").css("border-color", "#66afe9");
                }
                else if (evt.type === "focusout") {
                    $(".btn-deleteSearch").css("border-color", "#cccccc");
                }
            },

            /**
            *
            */
            "deleteSearchString": function () {
                this.model.setSearchString("");
                this.focusOnEnd($("#searchInput"));
                EventBus.trigger("removeOverlay", this.model.get("marker"));
                searchVector.getSource().clear();
            },

            /**
            *
            */
            "zoomTo": function (evt) {
                var zoomLevel, hitID, hit;
                if (_.has(evt, "cid")) {    // in diesem Fall ist evt = model, für die initiale Suche von B-Plänen --> workaround
                    hit = this.model.get("hitList")[0];
                }
                else {
                    hitID = evt.currentTarget.id;
                    hit = _.findWhere(this.model.get("hitList"), {id: hitID});
                }
                // NOTE switch case wäre angebracht
                $("#searchInput").val(hit.name);
                if (hit.type === "Straße") {
                    var wkt = this.getWKTFromString("POLYGON", hit.coordinate);
                    var format = new ol.format.WKT();
                    var feature = format.readFeature(wkt);
                    searchVector.getSource().clear();
                    searchVector.getSource().addFeature(feature);
                    searchVector.setVisible(true);
                    var extent = feature.getGeometry().getExtent();
                    EventBus.trigger("zoomToExtent", extent);
                    $(".dropdown-menu-search").hide();
                }
                else if (hit.type === "Krankenhaus") {
                    $(".dropdown-menu-search").hide();
                    EventBus.trigger("setCenter", hit.coordinate, 5);
                }
                else if (hit.type === "Adresse") {
                    zoomLevel = 7;
                    this.model.get("marker").setPosition(hit.coordinate);
                    $("#searchMarker").css("display", "block");
                    $(".dropdown-menu-search").hide();
                    EventBus.trigger("setCenter", hit.coordinate, zoomLevel);
                }
                else if (hit.type === "BPlan festgestellt" || hit.type === "BPlan im Verfahren") {
                    var typeName = (hit.type === "BPlan festgestellt") ? "hh_hh_planung_festgestellt" : "imverfahren";
                    var propertyName = (hit.type === "BPlan festgestellt") ? "planrecht" : "plan";
                    $.ajax({
                        url: Config.proxyURL + "?url=" + this.model.get("bPlanURL"),
                        data: "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd'><wfs:Query typeName='" + typeName + "'><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>app:" + propertyName + "</ogc:PropertyName><ogc:Literal>" + hit.name + "</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter></wfs:Query></wfs:GetFeature>",
                        type: "POST",
                        context: this,  // model
                        contentType: "text/xml",
                        success: function (data) {
                            var hits;
                            // Firefox, IE
                            if (data.getElementsByTagName("gml:posList")[0] !== undefined) {
                                var hits = data.getElementsByTagName("gml:posList")[0].textContent;
                                var wkt = this.getWKTFromString("POLYGON", hits);
                                var format = new ol.format.WKT();
                                var feature = format.readFeature(wkt);
                                searchVector.getSource().clear();
                                searchVector.getSource().addFeature(feature);
                                searchVector.setVisible(true);
                                // console.log(feature.getGeometry().getExtent());
                                var extent = feature.getGeometry().getExtent();
                                EventBus.trigger("zoomToExtent", extent);
                                $(".dropdown-menu-search").hide();
                            }
                            // WebKit
                            else if (data.getElementsByTagName("posList")[0] !== undefined) {
                                var hits = data.getElementsByTagName("posList")[0].textContent;
                                var wkt = this.getWKTFromString("POLYGON", hits);
                                var format = new ol.format.WKT();
                                var feature = format.readFeature(wkt);
                                searchVector.getSource().clear();
                                searchVector.getSource().addFeature(feature);
                                searchVector.setVisible(true);
                                // console.log(feature.getGeometry().getExtent());
                                var extent = feature.getGeometry().getExtent();
                                EventBus.trigger("zoomToExtent", extent);
                                $(".dropdown-menu-search").hide();
                            }
                        },
                        error: function () {
                            // $('#loader').hide();
                        }
                    });
                }
            },

            /**
            *
            */
            "showMarker": function (evt) {
                var hitID = evt.currentTarget.id;
                var hit = _.findWhere(this.model.get("hitList"), {id: hitID});
                if (hit.type === "Straße") {
                    var wkt = this.getWKTFromString("POLYGON", hit.coordinate);
                    var format = new ol.format.WKT();
                    var feature = format.readFeature(wkt);
                    searchVector.getSource().clear();
                    searchVector.setVisible(true);
                    searchVector.getSource().addFeature(feature);
                }
                else if (hit.type === "Adresse") {
                    this.model.get("marker").setPosition(hit.coordinate);
                    $("#searchMarker").css("display", "block");
                }
            },

            /**
            *
            */
            "hideMarker": function (evt) {
                $("#searchMarker").css("display", "none");
                searchVector.setVisible(false);
                if ($(".dropdown-menu-search").css("display") === "none") {
                    this.zoomTo(evt);
                }
            },

            /**
            *
            */
            "getWKTFromString": function (type, string) {
                var split = string.split(" ");
                var wkt = type + "((";
                _.each(split, function (element, index, list) {
                    if (index % 2 === 0) {
                        wkt += element + " ";
                    }
                    else if (index === list.length - 1) {
                        wkt += element + "))";
                    }
                    else {
                        wkt += element + ", ";
                    }

                });
                return wkt;
            },

            /**
            * Platziert den Cursor am Ende vom String
            * @param {Element} element - Das Dom-Element
            */
            focusOnEnd: function (element) {
                var strLength= element.val().length * 2;
                element.focus();
                element[0].setSelectionRange(strLength, strLength);
            }
        });

        return SearchbarView;
    });
