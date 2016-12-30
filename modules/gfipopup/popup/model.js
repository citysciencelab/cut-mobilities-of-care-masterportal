define(function (require) {
    require(["bootstrap/popover"]);

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Requestor = require("modules/core/requestor"),
        Moment = require("moment"),
        gfiParams = [],
        GFIPopup;

    GFIPopup = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            //
            gfiAttributes: "",
            element: $("#gfipopup"),
            gfiOverlay: {}, // ol.Overlay
            gfiContent: [],
            gfiTitles: [],
            gfiCounter: 0,
            isCollapsed: false,
            isVisible: false
        },
        /**
         *
         */
        initialize: function () {
            var channel = Radio.channel("GFIPopup");

            channel.on({
                "themeLoaded": this.themeLoaded
            }, this);

            channel.reply({
                "getGFIForPrint": this.getGFIForPrint,
                "getCoordinate": this.getCoordinate
            }, this);

            this.listenTo(Radio.channel("Requestor"), {
                "renderResults": this.getThemes
            });

            this.listenTo(Radio.channel("Tool"), {
                "activatedTool": this.checkTool
            });

            this.setGFIOverlay(new ol.Overlay({element: this.getElement()[0]}));

            Radio.trigger("Map", "addOverlay", this.get("gfiOverlay")); // listnener in map.js

            var activeItem = Radio.request("Parser", "getItemByAttributes", {isActive: true});

            if (!_.isUndefined(activeItem)) {
                this.checkTool(activeItem.id);
            }
        },
        checkTool: function (name) {
            if (name === "gfi") {
                Radio.trigger("Map", "registerListener", "click", this.setGFIParamsmap, this);
            }
            else {
                Radio.trigger("Map", "unregisterListener", "click", this.setGFIParamsmap, this);
            }
        },
        setGFIOverlay: function (overlay) {
            this.set("gfiOverlay", overlay);
        },
        getElement: function () {
            return this.get("element");
        },
        setElement: function (element) {
            this.set("element", element);
        },
        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
            this.getElement().popover("destroy");
            this.set("isPopupVisible", false);
            this.set("gfiContent", [], {silent: true});
            this.set("gfiTitles", [], {silent: true});
        },
        /**
         * Zeigt das Popup.
         */
        showPopup: function () {
            $("#popovermin").fadeOut(500, function () {
                $("#popovermin").remove();
            });

            $(this.getElement()).popover("show");
            this.set("isPopupVisible", true);
        },
        setGFIParams: function (params) {
            Radio.trigger("GFIPopup", "closeGFIParams");
            Requestor.requestFeatures(params);
        },
        getThemes: function (response) {console.log(response);
            var features = response,
                coordinate = this.getCoordinate(),
                templateView;

            // Erzeugen eines TemplateModels anhand 'gfiTheme'
            _.each(features, function (layer) {
                if (layer.ol_layer.get("gfiTheme") === "table") {
                    require(["modules/gfipopup/themes/table/view"], function (TableTheme) {
                        if (!_.isUndefined(layer.content) && layer.content.length > 0) {
                            var tableThemeView = new TableTheme(layer);
                            Radio.trigger("GFIPopup", "themeLoaded", tableThemeView, layer.name);
                        }
                    });
                }
                else {
                    _.each(layer.content, function (content) {
                        content = this.getManipulateDate(content);
                        switch (layer.ol_layer.get("gfiTheme")) {
                            case "mietenspiegel": {
                                require(["modules/gfipopup/themes/mietenspiegel/view"], function (MietenspiegelTheme) {
                                    templateView = new MietenspiegelTheme(layer.ol_layer, content, coordinate);
                                    Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name);
                                });
                                break;
                            }
                            case "reisezeiten": {
                                require(["modules/gfipopup/themes/reisezeiten/view"], function (ReisezeitenTheme) {
                                    templateView = new ReisezeitenTheme(content);
                                    Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name);
                                });
                                break;
                            }
                            case "trinkwasser": {
                                require(["modules/gfipopup/themes/trinkwasser/view"], function (TrinkwasserTheme) {
                                    templateView = new TrinkwasserTheme(layer.ol_layer, content, coordinate);
                                    Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name);
                                });
                                break;
                            }
                            case "solaratlas": {
                                require(["modules/gfipopup/themes/solaratlas/view"], function (TrinkwasserTheme) {
                                    templateView = new TrinkwasserTheme(layer.ol_layer, content, coordinate);
                                    Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name);
                                });
                                break;
                            }
                            default: {
                                require(["modules/gfipopup/themes/default/view"], function (DefaultTheme) {
                                    templateView = new DefaultTheme(layer.ol_layer, content);console.log(content);
                                    Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name);
                                });
                                break;
                            }
                        }
                    }, this);
                }
            }, this);
        },
        /*
        * Wenn Theme geladen wurde, wird dieses in gfiContent hineingeschrieben. Über setPosition wird Overlay jedesmal neu gerendert.
        */
        themeLoaded: function (templateView, layername) {
            var pContent = this.get("gfiContent"),
                pTitles = this.get("gfiTitles");

            pContent.push(templateView);
            pTitles.push(layername);

            this.set("gfiContent", pContent);
            this.set("gfiTitles", pTitles);
            this.set("gfiCounter", pContent.length);
            this.get("gfiOverlay").setPosition(this.getCoordinate());
            this.trigger("render");
            // this.unset("coordinate", {silent: true});
            // this.setCoordinate(coordinate);
        },
        /*
        * @description Liefert die GFI-Infos ans Print-Modul.
        */
        getGFIForPrint: function () {
            if (this.get("isPopupVisible") === true) {
                var printContent = this.get("gfiContent")[this.get("gfiCounter") - 1].model.returnPrintContent(),
                    attr = printContent[0],
                    title = printContent[1];

                return [attr, title, this.getCoordinate()];
            }
            else {
                return undefined;
            }
        },
        /**
         * Alle childTemplates im gfiContent müssen hier removed werden.
         * Das gfipopup.model wird nicht removed - nur reset.
         */
        removeChildObjects: function () {
            _.each(this.get("gfiContent"), function (element) {
                element.remove();
            }, this);
        },

        /**
         * Guckt alle Werte durch und prüft, ob es sich dabei um ein ISO8601-konformes Datum handelt.
         * Falls ja, wird es in das Format DD.MM.YYYY umgewandelt.
         * @param  {object} content - GFI Attribute
         * @return {object} content
         */
        getManipulateDate: function (content) {
            _.each(content, function (value, key, list) {
                if (Moment(value, Moment.ISO_8601, true).isValid() === true) {
                    list[key] = Moment(value).format("DD.MM.YYYY");
                }
            });
            return content;
        },

        setCoordinate: function (value, options) {
            this.set("coordinate", value, options);
        },

        getCoordinate: function () {
            return this.get("coordinate");
        },

        setGFIParamsmap: function (evt) {
            var visibleWMSLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false, typ: "WMS"}),
                visibleGroupLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false, typ: "GROUP"}),
                visibleLayerList = _.union(visibleWMSLayerList, visibleGroupLayerList),
                eventPixel = Radio.request("Map", "getEventPixel", evt.originalEvent),
                isFeatureAtPixel = Radio.request("Map", "hasFeatureAtPixel", eventPixel);

                this.setCoordinate(evt.coordinate, {silent: true});

            // Abbruch, wenn auf SerchMarker x geklcikt wird.
            if (this.checkInsideSearchMarker (eventPixel[1], eventPixel[0]) === true) {
                return;
            }

            // Vector
            Radio.trigger("ClickCounter", "gfi");
            if (isFeatureAtPixel === true) {
                Radio.trigger("Map", "forEachFeatureAtPixel", eventPixel, this.searchModelByFeature);
            }

            // WMS | GROUP
            _.each(visibleLayerList, function (model) {
                if (model.getGfiAttributes() !== "ignore") {
                    if (model.getTyp() === "WMS") {
                        gfiParams.push({
                            "model": model
                        });
                    }
                    else {
                        model.get("backbonelayers").forEach(function (layer) {
                            if (layer.get("gfiAttributes") !== "ignore") {
                                gfiParams.push({
                                    model: layer
                                });
                            }
                        });
                    }
                }
            }, this);
            this.setGFIParams(gfiParams);
            gfiParams = [];
        },

        searchModelByFeature: function (featureAtPixel, olLayer) {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: olLayer.get("id")});

            if (_.isUndefined(model) === false) {
                // Feature
                if (_.has(featureAtPixel.getProperties(), "features") === false) {
                    gfiParams.push({
                        "model": model,
                        "feature": featureAtPixel
                    });
                }
                // Cluster Feature
                else {
                    _.each(featureAtPixel.get("features"), function (feature) {
                        gfiParams.push({
                            "model": model,
                            "feature": feature
                        });
                    });
                }
            }
        },

        /**
        * Prüft, ob clickpunkt in RemoveIcon und liefert true/false zurück.
        */
        checkInsideSearchMarker: function (top, left) {
            var button = Radio.request("MapMarker", "getCloseButtonCorners"),
                bottomSM = button.bottom,
                leftSM = button.left,
                topSM = button.top,
                rightSM = button.right;

            if (top <= topSM && top >= bottomSM && left >= leftSM && left <= rightSM) {
                Radio.trigger("GFIPopup", "closeGFIParams");
                return true;
            }
            else {
                return false;
            }
        }
    });

    return GFIPopup;
});
