define(function (require) {
    var ol = require("openlayers"),
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
                tool;

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
                "activatedTool": function (id, deaktivateGFI) {
                    this.toggleGFI(id, deaktivateGFI);
                }
            });

            tool = Radio.request("Parser", "getItemByAttributes", {isActive: true});

            if (!_.isUndefined(tool)) {
                this.toggleGFI(tool.id);
            }
            this.initView();
            Radio.trigger("Map", "addOverlay", this.get("overlay"));
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
         * @param  {String} deaktivateGFI - soll durch aktivierung des Tools das GFI deaktiviert werden?
         * @return {undefined}
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
         * @return {undefined}
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

        /**
         *
         * @param {ol.MapBrowserPointerEvent} evt Event
         * @return {undefined}
         */
        setGfiParams: function (evt) {
            var visibleLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false}),
                visibleWMSLayerList = [],
                visibleVectorLayerList = [],
                eventPixel = Radio.request("Map", "getEventPixel", evt.originalEvent),
                vectorGFIParams,
                wmsGFIParams;

            Radio.trigger("ClickCounter", "gfi");

            // Zuordnen von Layertypen zur Abfrage
            _.each(visibleLayerList, function (layer) {
                var typ = layer.get("typ");

                if (typ === "WMS") {
                    visibleWMSLayerList.push(layer);
                }
                else if (typ === "GROUP") {
                    _.each(layer.get("layerSource"), function (layerSource) {
                        if (layerSource.get("typ") === "WMS") {
                            visibleWMSLayerList.push(layerSource);
                        }
                        else {
                            visibleVectorLayerList.push(layerSource);
                        }
                    }, this);
                }
                else {
                    visibleVectorLayerList.push(layer);
                }
            });

            this.setCoordinate(evt.coordinate);

            // Vector
            vectorGFIParams = this.getVectorGFIParams(visibleVectorLayerList, eventPixel);
            // WMS
            wmsGFIParams = this.getWMSGFIParams(visibleWMSLayerList);

            this.setThemeIndex(0);
            this.get("themeList").reset(_.union(vectorGFIParams, wmsGFIParams));
        },

        /**
         * Ermittelt die GFIParameter zur Abfrage von Vectorlayern
         * @param  {layer[]} layerlist  Liste der abzufragenden Vectorlayer
         * @param  {pixel} eventPixel   Pixelkoordinate
         * @return {object[]}           GFI-Parameter von Vektorlayern
         */
        getVectorGFIParams: function (layerlist, eventPixel) {
            var vectorGfiParams = [];

            _.each(layerlist, function (vectorLayer) {
                var features = Radio.request("Map", "getFeaturesAtPixel", eventPixel, {
                        layerFilter: function (layer) {
                            return layer.get("name") === vectorLayer.get("name");
                        },
                        hitTolerance: 0
                    }),
                    modelAttributes;

                _.each(features, function (featureAtPixel) {
                    modelAttributes = _.pick(vectorLayer.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable", "id", "isComparable");

                    // Feature
                    if (_.has(featureAtPixel.getProperties(), "features") === false) {
                        modelAttributes.feature = featureAtPixel;
                        vectorGfiParams.push(modelAttributes);
                    }
                    // Cluster Feature
                    else {
                        _.each(featureAtPixel.get("features"), function (feature) {
                            modelAttributes = _.pick(vectorLayer.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable");
                            modelAttributes.feature = feature;
                            vectorGfiParams.push(modelAttributes);
                        });
                    }
                }, this);
            }, this);

            return vectorGfiParams;
        },

        /**
         * Ermittelt die GFIParameter zur Abfrage von WMSlayern
         * @param  {layer[]} layerlist  Liste der abzufragenden WMSlayer
         * @return {object[]}           GFI-Parameter vom WMS-Layern
         */
        getWMSGFIParams: function (layerlist) {
            var wmsGfiParams = [];

            _.each(layerlist, function (layer) {
                if (layer.get("gfiAttributes") !== "ignore" || _.isUndefined(layer.get("gfiAttributes")) === true) {
                    layer.attributes.gfiUrl = layer.getGfiUrl();
                    wmsGfiParams.push(layer.attributes);
                }
            }, this);

            return wmsGfiParams;
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

        // Setter
        setCoordinate: function (value, options) {
            this.set("coordinate", value, options);
        },

        setCurrentView: function (value) {
            this.set("currentView", value);
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
