define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        ol = require("openlayers"),
        ThemeList = require("modules/tools/gfi/themes/list"),
        gfiParams = [],
        Gfi;

    Gfi = Backbone.Model.extend({
        defaults: {
            // detached | attached
            desktopViewType: "detached",
            // ist das Modal/Popover sichtbar
            isVisible: false,
            // mobile Ansicht true | false
            isMobile: Radio.request("Util", "isViewMobile"),
            // uiStyle DEFAULT | TABLE | SIMPLE
            uiStyle: Radio.request("Util", "getUiStyle"),
            // ol.Overlay für attached
            overlay: new ol.Overlay({element: undefined}),
            // desktop/attached/view.js | desktop/detached/view.js | mobile/view.js
            currentView: undefined,
            // Koordinate für das attached Popover und den Marker
            coordinate: undefined,
            // Verwaltet die Themes
            themeList: new ThemeList(),
            // Index für das aktuelle Theme
            themeIndex: 0,
            // Anzahl der Themes
            numberOfThemes: 0,
            rotateAngle: 0
        },
        initialize: function () {
            var channel = Radio.channel("GFI");

            channel.on({
                "setIsVisible": this.setIsVisible,
                "setGfiParams": this.setGfiParamsFromCustomModule
            }, this);

            channel.reply({
                "getIsVisible": this.getIsVisible,
                "getGFIForPrint": this.getGFIForPrint,
                "getCoordinate": this.getCoordinate,
                "getCurrentView": this.getCurrentView,
                "getVisibleTheme": this.getVisibleTheme
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
                        this.getThemeList().appendTheme(this.getThemeIndex());
                        this.getCurrentView().toggle();
                    }
                },
                "change:coordinate": function (model, value) {
                    this.setIsVisible(false);
                    this.getOverlay().setPosition(value);
                },
                "change:themeIndex": function (model, value) {
                    this.getThemeList().appendTheme(value);
                },
                "change:desktopViewType": function () {
                    Radio.trigger("Map", "addOverlay", this.getOverlay());
                }
            });

            this.listenTo(this.getThemeList(), {
                "isReady": function () {
                    if (this.getThemeList().length > 0) {
                        this.setNumberOfThemes(this.getThemeList().length);
                        this.getCurrentView().render();
                        this.getThemeList().appendTheme(0);
                        this.setIsVisible(true);
                    }
                    else {
                        this.setIsVisible(false);
                    }
                }
            });

            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": this.setIsMobile
            }, this);

            this.listenTo(Radio.channel("Tool"), {
                "activatedTool": function (id, deaktivateGFI) {
                    this.toggleGFI(id, deaktivateGFI);
                }
            });

            if (_.has(Config, "gfiWindow")) {
                this.setDesktopViewType(Config.gfiWindow);
            }

            var tool = Radio.request("Parser", "getItemByAttributes", {isActive: true});

            if (!_.isUndefined(tool)) {
                this.toggleGFI(tool.id);
            }
            this.initView();
        },

        /**
         * Prüft ob GFI aktiviert ist und registriert entsprechend den Listener oder eben nicht
         * @param  {String} id - Tool Id
         */
        toggleGFI: function (id, deaktivateGFI) {
            if (id === "gfi") {
                Radio.trigger("Map", "registerListener", "click", this.setGfiParams, this);
            }
            else if (deaktivateGFI === true) {
                Radio.trigger("Map", "unregisterListener", "click", this.setGfiParams, this);
            }
            else if (_.isUndefined(deaktivateGFI)) {
                Radio.trigger("Map", "unregisterListener", "click", this.setGfiParams, this);
            }
        },

        /**
         * Löscht vorhandene View - falls vorhanden - und erstellt eine neue
         * mobile | detached | attached
         */
        initView: function () {
            var CurrentView;

            // Beim ersten Initialisieren ist CurrentView noch undefined
            if (_.isUndefined(this.getCurrentView()) === false) {
                this.getCurrentView().removeView();
            }

            if (this.getIsMobile()) {
                CurrentView = require("modules/tools/gfi/mobile/view");
            }
            else {
                if (this.getDesktopViewType() === "attached") {
                    CurrentView = require("modules/tools/gfi/desktop/attached/view");
                }
                else if (this.getUiStyle() === "TABLE") {
                    CurrentView = require("modules/tools/gfi/table/view");
                }
                else {
                    CurrentView = require("modules/tools/gfi/desktop/detached/view");
                }
            }
            this.setCurrentView(new CurrentView({model: this}));
        },

        /**
         *
         * @param {ol.MapBrowserPointerEvent} evt
         */
        setGfiParams: function (evt) {
            var visibleWMSLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false, typ: "WMS"}),
                visibleGroupLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false, typ: "GROUP"}),
                visibleLayerList = _.union(visibleWMSLayerList, visibleGroupLayerList),
                eventPixel = Radio.request("Map", "getEventPixel", evt.originalEvent),
                isFeatureAtPixel = Radio.request("Map", "hasFeatureAtPixel", eventPixel);

            this.setCoordinate(evt.coordinate);

            // Vector
            Radio.trigger("ClickCounter", "gfi");
            if (isFeatureAtPixel === true) {
                Radio.trigger("Map", "forEachFeatureAtPixel", eventPixel, this.searchModelByFeature);
            }

            // WMS | GROUP
            _.each(visibleLayerList, function (model) {
                if (model.getGfiAttributes() !== "ignore" || _.isUndefined(model.getGfiAttributes()) === true) {
                    if (model.getTyp() === "WMS") {
                        model.attributes.gfiUrl = model.getGfiUrl();
                        gfiParams.push(model.attributes);
                    }
                    else {
                       _.each(model.getGfiParams(), function (params) {
                            params.gfiUrl = model.getGfiUrl(params, evt.coordinate, params.childLayerIndex);
                            gfiParams.push(params);
                        });
                    }
                }
            }, this);
            this.setThemeIndex(0);
            this.getThemeList().reset(gfiParams);
            gfiParams = [];
        },
        setGfiParamsFromCustomModule: function (params) {
            this.setCoordinate(params.coordinates);
            gfiParams = [{
                name: params.name,
                gfiAttributes: params.attributes,
                typ: params.typ,
                feature: params.feature,
                gfiTheme: params.gfiTheme
            }];
            this.getThemeList().reset(gfiParams);
            gfiParams = [];
        },
        /**
         *
         * @param  {ol.Feature} featureAtPixel
         * @param  {ol.layer.Vector} olLayer
         */
        searchModelByFeature: function (featureAtPixel, olLayer) {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: olLayer.get("id")});

            if (_.isUndefined(model) === false) {
                var modelAttributes = _.pick(model.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable", "id");
                // Feature
                if (_.has(featureAtPixel.getProperties(), "features") === false) {
                    modelAttributes.feature = featureAtPixel;
                    gfiParams.push(modelAttributes);
                }
                // Cluster Feature
                else {
                    _.each(featureAtPixel.get("features"), function (feature) {
                        modelAttributes = _.pick(model.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable");
                        modelAttributes.feature = feature;
                        gfiParams.push(modelAttributes);
                    });
                }
            }
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

        setThemeIndex: function (value) {
            this.set("themeIndex", value);
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

        getUiStyle: function () {
            return this.get("uiStyle");
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

        getThemeIndex: function () {
            return this.get("themeIndex");
        },

        getThemeList: function () {
            return this.get("themeList");
        },

        /*
        * @description Liefert die GFI-Infos ans Print-Modul.
        */
        getGFIForPrint: function () {
            var theme = this.getThemeList().at(this.getThemeIndex());

            return [theme.getGfiContent()[0], theme.get("name"), this.getCoordinate()];
        },

        getVisibleTheme: function () {
            return this.getThemeList().findWhere({isVisible: true});
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
                return true;
            }
            else {
                return false;
            }
        }

    });

    return Gfi;
});
