define(function (require) {
    var Cesium = require("cesium"),
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
            var channel = Radio.channel("GFI"),
                tool = Radio.request("Parser", "getItemByAttributes", {isActive: true});

            channel.on({
                "setIsVisible": this.setIsVisible,
                "setGfiParams": this.setGfiParamsFromCustomModule,
                "changeFeature": this.changeFeature
            }, this);

            channel.reply({
                "getIsVisible": function () {
                    return this.get("isVisible");
                },
                "getGFIForPrint": this.getGFIForPrint,
                "getCoordinate": function () {
                    return this.get("coordinate");
                },
                "getCurrentView": function () {
                    return this.get("currentView");
                },
                "getVisibleTheme": this.getVisibleTheme
            }, this);

            this.listenTo(this, {
                "change:isVisible": function (model, value) {
                    channel.trigger("isVisible", value);
                    if (value === false && this.get("numberOfThemes") > 0) {
                        this.get("themeList").setAllInVisible();
                    }
                },
                "change:isMobile": function () {
                    this.initView();
                    if (this.get("isVisible") === true) {
                        this.get("currentView").render();
                        this.get("themeList").appendTheme(this.get("themeIndex"));
                        this.get("currentView").toggle();
                    }
                },
                "change:coordinate": function (model, value) {
                    this.setIsVisible(false);
                    this.get("overlay").setPosition(value);
                },
                "change:themeIndex": function (model, value) {
                    this.get("themeList").appendTheme(value);
                },
                "change:desktopViewType": function () {
                    Radio.trigger("Map", "addOverlay", this.get("overlay"));
                }
            });

            this.listenTo(this.get("themeList"), {
                "isReady": function () {
                    if (this.get("themeList").length > 0) {
                        this.setNumberOfThemes(this.get("themeList").length);
                        this.get("currentView").render();
                        this.get("themeList").appendTheme(0);
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

            tool = Radio.request("Parser", "getItemByAttributes", {isActive: true});

            if (!_.isUndefined(tool)) {
                this.toggleGFI(tool.id);
            }
            this.initView();
        },

        /**
         * if the displayed feature changes, the model is recreated and the gfi adjusted
         * @param  {ol.Feature} feature - the feature which has been changed
         * @returns {void}
         */
        changeFeature: function (feature) {
            var gfiFeature,
                gfiTheme;

            if (this.get("isVisible")) {
                gfiFeature = this.get("themeList").models[0].attributes.feature;

                if (gfiFeature === feature) {
                    gfiTheme = this.get("themeList").models[0].attributes.gfiTheme;

                    Radio.trigger("gfiList", "redraw");
                    Radio.trigger(gfiTheme + "Theme", "changeGfi");
                }
            }
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
            if (_.isUndefined(this.get("currentView")) === false) {
                this.get("currentView").removeView();
            }

            if (this.get("isMobile")) {
                CurrentView = require("modules/tools/gfi/mobile/view");
            }
            else if (this.get("desktopViewType") === "attached") {
                CurrentView = require("modules/tools/gfi/desktop/attached/view");
            }
            else if (this.get("uiStyle") === "TABLE") {
                CurrentView = require("modules/tools/gfi/table/view");
            }
            else {
                CurrentView = require("modules/tools/gfi/desktop/detached/view");
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
                if (model.get("gfiAttributes") !== "ignore" || _.isUndefined(model.get("gfiAttributes")) === true) {
                    if (model.get("typ") === "WMS") {
                        model.attributes.gfiUrl = model.getGfiUrl(resolution, coordinate, projection);
                        gfiParams.push(model.attributes);
                    }
                    else {
                        _.each(model.get("gfiParams"), function (params) {
                            params.gfiUrl = model.getGfiUrl(params, evt.coordinate, params.childLayerIndex);
                            gfiParams.push(params);
                        });
                    }
                }
            }, this);
            this.setThemeIndex(0);
            this.get("themeList").reset(gfiParams);
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
            this.get("themeList").reset(gfiParams);
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
                modelAttributes = _.pick(model.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable", "id", "isComparable");

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
            this.get("overlay").setElement(value);
        },

        setThemeIndex: function (value) {
            this.set("themeIndex", value);
        },

        getOverlayElement: function () {
            return this.get("overlay").getElement();
        },

        /*
        * @description Liefert die GFI-Infos ans Print-Modul.
        */
        getGFIForPrint: function () {
            var theme = this.get("themeList").at(this.get("themeIndex"));

            return [theme.get("gfiContent")[0], theme.get("name"), this.get("coordinate")];
        },

        getVisibleTheme: function () {
            return this.get("themeList").findWhere({isVisible: true});
        },

        /**
        * Prüft, ob clickpunkt in RemoveIcon und liefert true/false zurück.
        * @param  {integer} top Pixelwert
        * @param  {integer} left Pixelwert
        * @return {undefined}
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
            return false;
        }
    });

    return Gfi;
});
