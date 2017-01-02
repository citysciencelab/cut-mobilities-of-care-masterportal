define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        ol = require("openlayers"),
        ThemeList = require("modules/gfi/themes/list"),
        gfiParams = [],
        Gfi;

    Gfi = Backbone.Model.extend({
        defaults: {
            // detached || attached
            desktopViewType: "detached",
            // ist das Modal/Popover sichtbar
            isVisible: false,
            // ol.Overlay für attached
            overlay: new ol.Overlay({element: undefined}),
            // desktop/attached/view.js || desktop/detached/view.js || mobile/view.js
            currentView: undefined,
            // Koordinate für das attached Popover und den Marker
            coordinate: undefined,
            // Verwaltet die Themes
            themeList: new ThemeList(),

            currentCount: 0,
            numberOfThemes: 0
        },
        initialize: function () {
            var channel = Radio.channel("GFI");

            channel.reply({
                "getGFIForPrint": this.getGFIForPrint,
                "getCoordinate": this.getCoordinate
            }, this);

            channel.on({
                "setIsVisible": this.setIsVisible
            }, this);

            this.listenTo(this, {
                "change:isVisible": function (model, value) {
                    channel.trigger("isVisible", value);
                    if (value === false && this.getNumberOfThemes() > 0) {
                        this.getThemeList().setAllInVisible();
                    }
                },
                "change:isMobile": function () {
                    this.initView();
                    if (this.getIsVisible() === true) {
                        this.getCurrentView().render();
                        this.getCurrentView().toggle();
                        this.getThemeList().appendTheme(this.get("currentCount"));
                    }
                },
                "change:coordinate": function (model, value) {
                    this.getOverlay().setPosition(value);
                },
                "change:currentCount": function (model, value) {
                    this.getThemeList().appendTheme(value);
                }
            });

            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": this.setIsMobile
            }, this);

            this.listenTo(this.getThemeList(), {
                "ready": function () {
                    this.setNumberOfThemes(this.getThemeList().length);
                    if (this.getNumberOfThemes() > 0) {
                        this.getCurrentView().render();
                        this.setIsVisible(true);
                        this.getThemeList().appendTheme(this.get("currentCount"));
                    }
                    else {
                        this.setIsVisible(false);
                    }
                }
            });

            if (_.has(Config, "gfiWindow")) {
                this.setDesktopViewType(Config.gfiWindow);
            }

            this.setIsMobile(Radio.request("Util", "isViewMobile"));

            var channel = Radio.channel("GFIPopup");

            this.listenTo(Radio.channel("Tool"), {
                "activatedTool": this.checkTool
            });

            Radio.trigger("Map", "addOverlay", this.getOverlay()); // listnener in map.js

            var activeItem = Radio.request("Parser", "getItemByAttributes", {isActive: true});

            if (!_.isUndefined(activeItem)) {
                this.checkTool(activeItem.id);
            }
        },

        /**
         *
         */
        initView: function () {
            var CurrentView;

            // Beim ersten Initialisieren ist CurrentView noch undefined
            if (_.isUndefined(this.getCurrentView()) === false) {
                this.getCurrentView().removeView();
            }

            if (this.getIsMobile()) {
                CurrentView = require("modules/gfi/mobile/view");
            }
            else {
                if (this.getDesktopViewType() === "attached") {
                    CurrentView = require("modules/gfi/desktop/attached/view");
                }
                else {
                    CurrentView = require("modules/gfi/desktop/detached/view");
                }
            }
            this.setCurrentView(new CurrentView({model: this}));
        },

        // Setter
        setCoordinate: function (value, options) {
            this.set("coordinate", value, options);
        },

        setCurrentView: function (value) {
            this.set("currentView", value);
        },

        setDesktopViewType: function (value) {
            this.set("desktopViewType", value);
        },

        setIsMobile: function (value) {
            this.set("isMobile", value);
        },

        setIsVisible: function (value) {
            this.set("isVisible", value);
        },

        setNumberOfThemes: function (value) {
            this.set("numberOfThemes", value);
        },

        setOverlayElement: function (value) {
            this.getOverlay().setElement(value);
        },

        // Getter
        getCoordinate: function () {
            return this.get("coordinate");
        },

        getCurrentView: function () {
            return this.get("currentView");
        },

        getDesktopViewType: function () {
            return this.get("desktopViewType");
        },

        getIsMobile: function () {
            return this.get("isMobile");
        },

        getIsVisible: function () {
            return this.get("isVisible");
        },

        getNumberOfThemes: function () {
            return this.get("numberOfThemes");
        },

        getOverlay: function () {
            return this.get("overlay");
        },

        getOverlayElement: function () {
            return this.getOverlay().getElement();
        },

        getThemeList: function () {
            return this.get("themeList");
        },

        checkTool: function (name) {
            if (name === "gfi") {
                Radio.trigger("Map", "registerListener", "click", this.setGFIParamsmap, this);
            }
            else {
                Radio.trigger("Map", "unregisterListener", "click", this.setGFIParamsmap, this);
            }
        },

        /*
        * @description Liefert die GFI-Infos ans Print-Modul.
        */
        getGFIForPrint: function () {
            if (this.get("isPopupVisible") === true) {
                var printContent = this.get("gfiContent")[this.get("numberOfThemes") - 1].model.returnPrintContent(),
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

        setGFIParamsmap: function (evt) {
            var visibleWMSLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false, typ: "WMS"}),
                visibleGroupLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false, typ: "GROUP"}),
                visibleLayerList = _.union(visibleWMSLayerList, visibleGroupLayerList),
                eventPixel = Radio.request("Map", "getEventPixel", evt.originalEvent),
                isFeatureAtPixel = Radio.request("Map", "hasFeatureAtPixel", eventPixel);

                this.setCoordinate(evt.coordinate);

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
                        model.attributes.gfiUrl = model.getGfiUrl();
                        gfiParams.push(model.attributes);
                    }
                    else {
                        model.get("backbonelayers").forEach(function (layer) {
                            if (layer.get("gfiAttributes") !== "ignore") {
                                model.attributes.gfiUrl = model.getGfiUrl();
                                gfiParams.push(model.attributes);
                            }
                        });
                    }
                }
            }, this);
            this.set("currentCount", 0);
            this.getThemeList().reset(gfiParams);
            gfiParams = [];
        },

        searchModelByFeature: function (featureAtPixel, olLayer) {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: olLayer.get("id")});

            if (_.isUndefined(model) === false) {
                var modelAttributes = _.pick(model.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable");
                // Feature
                if (_.has(featureAtPixel.getProperties(), "features") === false) {
                    modelAttributes.feature = featureAtPixel;
                    gfiParams.push(modelAttributes);
                }
                // Cluster Feature
                else {
                    _.each(featureAtPixel.get("features"), function (feature) {
                        modelAttributes.feature = feature;
                        gfiParams.push(modelAttributes);
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
                this.setIsVisible(false);
                return true;
            }
            else {
                return false;
            }
        }

    });

    return Gfi;
});
