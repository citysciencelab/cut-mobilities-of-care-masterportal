define([
    "backbone",
    "backbone.radio",
    "eventbus",
    "openlayers",
    "config",
    "bootstrap/popover",
    "modules/core/requestor",
    "moment"
//    "modules/gfipopup/themes/mietenspiegel/view-formular" // muss hier definiert werden, weil in mietenspiegelform.js nicht in gebauter Version verfügbar
], function (Backbone, Radio, EventBus, ol, Config, Popover, Requestor, Moment) {
    "use strict";
    var GFIPopup = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            element: $("#gfipopup"),
            gfiOverlay: {}, // ol.Overlay
            gfiContent: [],
            gfiTitles: [],
            wfsCoordinate: [],
            gfiURLs: [],
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
                "getGFIForPrint": this.getGFIForPrint
            }, this);

            this.setGFIOverlay(new ol.Overlay({element: this.getElement()[0]}));

            EventBus.trigger("addOverlay", this.get("gfiOverlay")); // listnener in map.js
            EventBus.on("setGFIParams", this.setGFIParams, this); // trigger in map.js
            EventBus.on("sendGFIForPrint", this.sendGFIForPrint, this);
            EventBus.on("renderResults", this.getThemes, this);
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
            this.unset("coordinate", {silent: true});
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
            // Für Straßenbaumkataster TODO
            // if (_.has(Config.tools.gfi, "zoomTo") && Radio.request("MapView", "getZoomLevel") < 7) {
            //      Radio.trigger("MapView", "setCenter", this.get("coordinate"), 7);
            // }
            $(this.getElement()).popover("show");
            this.set("isPopupVisible", true);
        },
        setGFIParams: function (params) {
            EventBus.trigger("closeGFIParams", this);
            Requestor.requestFeatures(params);
        },
        getThemes: function (response) {
            var features = response[0],
                coordinate = response[1],
                templateView;
            // Erzeugen eines TemplateModels anhand 'gfiTheme'
            _.each(features, function (layer) {
                _.each(layer.content, function (content) {
                    content = this.getManipulateDate(content);
                    switch (layer.ol_layer.get("gfiTheme")) {
                        case "mietenspiegel": {
                            require(["modules/gfipopup/themes/mietenspiegel/view", "backbone.radio"], function (MietenspiegelTheme, Radio) {
                                templateView = new MietenspiegelTheme(layer.ol_layer, content, coordinate);
                                Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name, coordinate);
                            });
                            break;
                        }
                        case "reisezeiten": {
                            require(["modules/gfipopup/themes/reisezeiten/view", "backbone.radio"], function (ReisezeitenTheme, Radio) {
                                templateView = new ReisezeitenTheme(content);
                                Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name, coordinate);
                            });
                            break;
                        }
                        case "trinkwasser": {
                            require(["modules/gfipopup/themes/trinkwasser/view", "backbone.radio"], function (TrinkwasserTheme, Radio) {
                                templateView = new TrinkwasserTheme(layer.ol_layer, content, coordinate);
                                Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name, coordinate);
                            });
                            break;
                        }
                        case "solaratlas": {
                            require(["modules/gfipopup/themes/solaratlas/view"], function (TrinkwasserTheme) {
                                templateView = new TrinkwasserTheme(layer.ol_layer, content, coordinate);
                                Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name, coordinate);
                            });
                            break;
                        }
                        default: {
                            require(["modules/gfipopup/themes/default/view", "backbone.radio"], function (DefaultTheme, Radio) {
                                templateView = new DefaultTheme(layer.ol_layer, content, coordinate);
                                Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name, coordinate);
                            });
                            break;
                        }
                    }
                }, this);
            }, this);
        },
        /*
        * Wenn Theme geladen wurde, wird dieses in gfiContent hineingeschrieben. Über setPosition wird Overlay jedesmal neu gerendert.
        */
        themeLoaded: function (templateView, layername, coordinate) {
            var pContent = this.get("gfiContent"),
                pTitles = this.get("gfiTitles");

            pContent.push(templateView);
            pTitles.push(layername);

            this.set("gfiContent", pContent);
            this.set("gfiTitles", pTitles);
            this.set("gfiCounter", pContent.length);
            this.get("gfiOverlay").setPosition(coordinate);
            this.unset("coordinate", {silent: true});
            this.set("coordinate", coordinate);
        },
        /*
        * @description Liefert die GFI-Infos ans Print-Modul.
        */
        getGFIForPrint: function () {
            if (this.get("isPopupVisible") === true) {
                var printContent = this.get("gfiContent")[this.get("gfiCounter") - 1].model.returnPrintContent(),
                    attr = printContent[0],
                    title = printContent[1];

                return [attr, title, this.get("coordinate")];
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
                if (Moment(value).parsingFlags().overflow === -1) {
                    list[key] = Moment(value).format("DD.MM.YYYY");
                }
            });
            return content;
        }
    });

    return new GFIPopup();
});
