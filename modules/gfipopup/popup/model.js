define(function (require) {
    require(["bootstrap/popover"]);

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        EventBus = require("eventbus"),
        ol = require("openlayers"),
        Requestor = require("modules/core/requestor"),
        Moment = require("moment"),
        GFIPopup;

    GFIPopup = Backbone.Model.extend({
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
                "getGFIForPrint": this.getGFIForPrint,
                "getCoordinates": this.getCoordinates
            }, this);

            this.listenTo(Radio.channel("Requestor"), {
                "renderResults": this.getThemes
            });

            this.setGFIOverlay(new ol.Overlay({element: this.getElement()[0]}));

            Radio.trigger("Map", "addOverlay", this.get("gfiOverlay")); // listnener in map.js
            Radio.on("Map", "setGFIParams", this.setGFIParams, this); // trigger in map.js
            EventBus.on("sendGFIForPrint", this.sendGFIForPrint, this);
            // EventBus.on("renderResults", this.getThemes, this);
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

            $(this.getElement()).popover("show");
            this.set("isPopupVisible", true);
        },
        setGFIParams: function (params) {
            Radio.trigger("GFIPopup", "closeGFIParams");
            Requestor.requestFeatures(params);
        },
        getThemes: function (response) {
            var features = response[0],
                coordinate = response[1],
                templateView;
            // Erzeugen eines TemplateModels anhand 'gfiTheme'
            _.each(features, function (layer) {
                if (layer.ol_layer.get("gfiTheme") === "table") {
                    require(["modules/gfipopup/themes/table/view"], function (TableTheme) {
                        if (!_.isUndefined(layer.content) && layer.content.length > 0) {
                            var tableThemeView = new TableTheme(layer);
                            Radio.trigger("GFIPopup", "themeLoaded", tableThemeView, layer.name, coordinate);
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
                                    Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name, coordinate);
                                });
                                break;
                            }
                            case "reisezeiten": {
                                require(["modules/gfipopup/themes/reisezeiten/view"], function (ReisezeitenTheme) {
                                    templateView = new ReisezeitenTheme(content);
                                    Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name, coordinate);
                                });
                                break;
                            }
                            case "trinkwasser": {
                                require(["modules/gfipopup/themes/trinkwasser/view"], function (TrinkwasserTheme) {
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
                                require(["modules/gfipopup/themes/default/view"], function (DefaultTheme) {
                                    templateView = new DefaultTheme(layer.ol_layer, content, coordinate);
                                    Radio.trigger("GFIPopup", "themeLoaded", templateView, layer.name, coordinate);
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
                if (Moment(value, Moment.ISO_8601, true).isValid() === true) {
                    list[key] = Moment(value).format("DD.MM.YYYY");
                }
            });
            return content;
        },
        getCoordinates: function () {
            return this.get("coordinate");
        }
    });

    return new GFIPopup();
});
