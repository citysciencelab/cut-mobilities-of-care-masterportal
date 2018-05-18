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
            numberOfThemes: 0
            // active3d: false
        },
        initialize: function () {
            var channel = Radio.channel("GFI"),
                tool = Radio.request("Parser", "getItemByAttributes", {isActive: true});

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
                "activatedTool": function (id, deactivateGFI) {
                    this.toggleGFI(id, deactivateGFI);
                }
            });

            if (_.has(Config, "gfiWindow")) {
                this.setDesktopViewType(Config.gfiWindow);
            }

            if (!_.isUndefined(tool)) {
                this.toggleGFI(tool.id);
            }
            this.initView();
        },

        /**
         * Prüft ob GFI aktiviert ist und registriert entsprechend den Listener oder eben nicht
         * @param  {String} id - Tool Id
         * @param {bool} deactivateGFI Flag if GFI has to be deactivated
         * @return {void}
         */
        toggleGFI: function (id, deactivateGFI) {
            if (id === "gfi") {
                Radio.trigger("Map", "registerListener", "click", this.setGfiParams, this);

                this.listenTo(Radio.channel("Map"), {
                    "clickedWindowPosition": this.setGfiParams
                }, this);
            }
            else if (deactivateGFI === true) {
                Radio.trigger("Map", "unregisterListener", "click", this.setGfiParams, this);
                this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
            }
            else if (_.isUndefined(deactivateGFI)) {
                Radio.trigger("Map", "unregisterListener", "click", this.setGfiParams, this);
                this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
            }
        },

        /**
         * Löscht vorhandene View - falls vorhanden - und erstellt eine neue
         * mobile | detached | attached
         * @return {void}
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
                else {
                    CurrentView = require("modules/tools/gfi/desktop/detached/view");
                }
            }
            this.setCurrentView(new CurrentView({model: this}));
        },

        setGfiParams3d: function (evt) {
            var features;

            features = Radio.request("Map", "getFeatures3dAtPosition", evt.position);
            this.setCoordinate(evt.coordinate);
            _.each(features, function (feature) {
                var properties = {},
                    propertyNames,
                    modelattributes,
                    olFeature,
                    layer;

                if (feature instanceof Cesium.Cesium3DTileFeature) {
                    propertyNames = feature.getPropertyNames();
                    _.each(propertyNames, function (propertyName) {
                        properties[propertyName] = feature.getProperty(propertyName);
                    });
                    if (properties.attributes && properties.id) {
                        properties.attributes.gmlid = properties.id;
                    }
                    modelattributes = {
                        attributes: properties.attributes ? properties.attributes : properties,
                        gfiAttributes: "showAll",
                        typ: "Cesium3DTileFeature",
                        name: "Buildings"
                    };
                    gfiParams.push(modelattributes);
                }
                else if (feature.primitive) {
                    olFeature = feature.primitive.olFeature;
                    layer = feature.primitive.olLayer;
                    if (olFeature && layer) {
                        this.searchModelByFeature(olFeature, layer);
                    }
                }
            }, this);
        },

        setGfiParams: function (evt) {
            console.log(this);
            var visibleWMSLayerList,
                visibleGroupLayerList,
                visibleLayerList,
                eventPixel,
                isFeatureAtPixel,
                resolution,
                projection,
                coordinate = evt.coordinate;

            if (Radio.request("Map", "isMap3d")) {
                this.setGfiParams3d(evt);
            }
            visibleWMSLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false, typ: "WMS"});
            visibleGroupLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false, typ: "GROUP"});
            visibleLayerList = _.union(visibleWMSLayerList, visibleGroupLayerList);
            eventPixel = Radio.request("Map", "getEventPixel", evt.originalEvent);
            isFeatureAtPixel = Radio.request("Map", "hasFeatureAtPixel", eventPixel);
            this.setCoordinate(coordinate);

            // Vector
            Radio.trigger("ClickCounter", "gfi");
            if (isFeatureAtPixel === true) {
                Radio.trigger("Map", "forEachFeatureAtPixel", eventPixel, this.searchModelByFeature);
            }
            resolution = Radio.request("MapView", "getResolution").resolution;
            projection = Radio.request("MapView", "getProjection");
            // WMS | GROUP
            _.each(visibleLayerList, function (model) {
                if (model.getGfiAttributes() !== "ignore" || _.isUndefined(model.getGfiAttributes()) === true) {
                    if (model.getTyp() === "WMS") {
                        model.attributes.gfiUrl = model.getGfiUrl(resolution, coordinate, projection);
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
         * @param {ol.Feature} featureAtPixel Feature
         * @param {ol.Layer} olLayer Layer
         * @return {void}
         */
        searchModelByFeature: function (featureAtPixel, olLayer) {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: olLayer.get("id")}),
                modelAttributes;

            if (_.isUndefined(model) === false) {
                modelAttributes = _.pick(model.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable", "id");
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
        }
    });

    return Gfi;
});
