define([
    "backbone",
    "eventbus",
    "config",
    "text!modules/featurelister/template.html",
    "modules/featurelister/model",
    "modules/core/util",
    "modules/menubar/view"
], function (Backbone, EventBus, Config, Template, Model, Util) {

    var WFSListView = Backbone.View.extend({
        model: Model,
        className: "wfslist-win",
        template: _.template(Template),
        events: {
            "click .glyphicon-remove": "toggle",
            "click #wfslistFeaturelist": "switchTabToListe",
            "click #wfslistThemeChooser": "switchTabToTheme",
            "click #wfslistFeaturedetails": "switchTabToDetails",
            "click .wfslist-themes-li": "newTheme",
            "mouseover .wfslist-list-table-tr": "hoverTr",
            "click .wfslist-list-table-tr": "selectTr",
            "click .wfslist-list-button": "moreFeatures"
        },
        initialize: function () {
            if (!Util.isAny()) { // nicht in mobiler Variante
                this.listenTo(this.model, {"change:layerlist": this.updateVisibleLayer});
                this.listenTo(this.model, {"change:layer": this.updateLayerHeader});
                this.listenTo(this.model, {"change:layer": this.updateLayerList});
                this.listenTo(this.model, {"change:layer": this.switchTabToListe});
                this.listenTo(this.model, {"change:featureProps": this.showFeatureProps});
                this.listenTo(EventBus, {"toggleFeatureListerWin": this.toggle});
                this.render();
                if (Config.startUpModul.toUpperCase() === "FEATURELIST") {
                    this.toggle();
                }
            }
        },
        moreFeatures: function () {
            var countFeatures = $("#wfslist-list-table tbody").children().length,
                maxFeatures = this.model.get("maxFeatures"),
                toFeatures = countFeatures + maxFeatures - 1;

            $("#wfslist-list-table tbody").append(this.getTDfromFeatures(countFeatures, toFeatures));
        },
        showFeatureProps: function () {
            var props = this.model.get("featureProps");

            this.switchTabToDetails();
            $(".wfslist-details-li").remove();
            _.each(props, function (value, key) {
                $(".wfslist-details-ul").append("<li class='list-group-item list-group-item-info wfslist-details-li'>" + key + "</li>");
                $(".wfslist-details-ul").append("<li class='list-group-item wfslist-details-li'>" + value + "</li>");
            });
        },
        switchTabToListe: function () {
            _.each($(".wfslist-navtabs").children(), function (child) {
                if (child.id === "wfslistFeaturelist") {
                    $(child).addClass("active");
                }
                else {
                    $(child).removeClass("active");
                }
            });
            $("#wfslist-themes").hide();
            $("#wfslist-list").show();
            $("#wfslist-details").hide();
        },
        switchTabToTheme: function () {
            _.each($(".wfslist-navtabs").children(), function (child) {
                if (child.id === "wfslistThemeChooser") {
                    $(child).addClass("active");
                }
                else {
                    $(child).removeClass("active");
                }
            });
            $("#wfslist-themes").show();
            $("#wfslist-list").hide();
            $("#wfslist-details").hide();
        },
        switchTabToDetails: function () {
            _.each($(".wfslist-navtabs").children(), function (child) {
                if (child.id === "wfslistFeaturedetails") {
                    $(child).addClass("active");
                }
                else {
                    $(child).removeClass("active");
                }
            });
            $("#wfslist-themes").hide();
            $("#wfslist-list").hide();
            $("#wfslist-details").show();
        },
        selectTr: function (evt) {
            var featureid = evt.currentTarget.id;

            this.model.set("featureid", featureid);
        },
        hoverTr: function (evt) {
            var featureid = evt.currentTarget.id;

            this.model.showMarker(featureid);
        },
        newTheme: function (evt) {
            this.model.set("layerid", evt.currentTarget.id);
            // setze active Class
            _.each($(evt.currentTarget.parentElement.children), function (li) {
                $(li).removeClass("active");
            });
            $(evt.currentTarget).addClass("active");
        },
        updateLayerList: function () {
            // lt. Mathias liefern Dienste, bei denen ein Feature in einem Attribut ein null-Value hat, dieses nicht aus und es erscheint gar nicht am Feature.
            var features = this.model.get("layer").features,
                maxFeatures = this.model.get("maxFeatures") - 1,
                keyslist = [];

            // Extrahiere vollständige Überschriftenliste, funktioniert nicht sollten Kommas im Key stehen. Darf aber wohl nicht vorkommen.
            _.each(features, function (feature) {
                _.each(_.keys(feature.properties), function (key) {
                    if (_.contains(keyslist, key) === false) {
                        keyslist.push(key);
                    }
                }, this);
            }, this);
            this.model.set("headers", keyslist);
            $("#wfslist-list-table tr").remove(); // leere Tabelle
            $("#wfslist-list-table").prepend("<thead><tr><th>" + keyslist.toString().replace(/,/g, "</th><th>") + "</th></tr></thead>");
            $("#wfslist-list-table").append("<tbody>");
            $("#wfslist-list-table").append(this.getTDfromFeatures(0, maxFeatures));
            $("#wfslist-list-table").append("</tbody>");
        },
        getTDfromFeatures: function (from, to) {
            var features = _.filter(this.model.get("layer").features, function (feature) {
                    return feature.id >= from && feature.id <= to;
                }),
                featuresCount = this.model.get("layer").features.length,
                properties = "",
                headers = this.model.get("headers");

            // Schreibe für jedes Feature...
            _.each(features, function (feature) {
                properties += "<tr id='" + feature.id + "' class='wfslist-list-table-tr'>";
                // entsprechend der Reihenfolge der Überschriften...
                _.each(headers, function (header) {
                    var attvalue = "";

                   _.each(feature.properties, function (value, key) {
                        if (header === key) {
                            attvalue = value;
                        }
                    }, this);
                    properties += "<td><div class='wfslist-list-table-td' title='" + attvalue + "'>";
                    properties += attvalue;
                    properties += "</div></td>";
                }, this);
                properties += "</tr>";
            }, this);
            if (to < featuresCount) {
                $(".wfslist-list-button").show();
            }
            else {
                $(".wfslist-list-button").hide();
            }
            return properties;
        },
        updateLayerHeader: function () {
            $("#wfslist-list-header").text(this.model.get("layer").name);
        },
        updateVisibleLayer: function (layerlist) {
            var ll = this.model.get("layerlist");

            $("#wfslist-themes-ul").empty();
            _.each(ll, function (layer) {
                $("#wfslist-themes-ul").append("<li id='" + layer.id + "' class='wfslist-themes-li' role='presentation'><a href='#'>" + layer.name + "</a></li>");
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
        },
        toggle: function () {
            this.$el.toggle();
        }
    });

    return WFSListView;
});
