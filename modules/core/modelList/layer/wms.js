define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        ol = require("openlayers"),
        WMSLayer;

    WMSLayer = Layer.extend({
        initialize: function () {
            this.superInitialize();
            this.setAttributes();
        },
        setAttributes: function () {
            if (_.isUndefined(this.getInfoFormat()) === true) {
                this.setInfoFormat("text/xml");
            }
        },

        /**
         * [createLayerSource description]
         * @return {[type]} [description]
         */
        createLayerSource: function () {
            var params;

            params = {
                t: new Date().getMilliseconds(),
                zufall: Math.random(),
                LAYERS: this.getLayers(),
                FORMAT: this.getImageFormat() === "nicht vorhanden" ? "image/png" : this.getImageFormat(),
                VERSION: this.getVersion(),
                TRANSPARENT: this.getTransparent().toString()
            };

            if (this.get("styles") && this.get("styles") !== "" && this.get("styles") !== "nicht vorhanden") {
                params = _.extend(params, {
                    STYLES: this.get("styles")
                });
            }
            this.set("tileloaderror", false);
            if (this.get("singleTile") !== true) {
                this.set("tileCountloaderror", 0);
                this.set("tileCount", 0);
                var source = new ol.source.TileWMS({
                        url: this.get("url"),
                        attributions: this.get("olAttribution"),
                        gutter: this.get("gutter"),
                        params: params,
                        tileGrid: new ol.tilegrid.TileGrid({
                            resolutions: Radio.request("MapView", "getResolutions"),
                            origin: [
                                442800,
                                5809000
                            ],
                            tileSize: parseInt(this.get("tilesize"), 10)
                        }),
                        crossOrigin: "anonymous"
                    }),
                    context = this;

                // wms_webatlasde
                source.on("tileloaderror", function () {
                    if (context.get("tileloaderror") === false) {
                        context.set("tileloaderror", true);
                        if (!navigator.cookieEnabled) {
                            if (context.get("url").indexOf("wms_webatlasde") !== -1) {
                                Radio.trigger("Alert", "alert", {text: "<strong>Bitte erlauben sie Cookies, damit diese Hintergrundkarte geladen werden kann.</strong>", kategorie: "alert-warning"});
                            }
                        }
                    }

                });

                this.setLayerSource(source);
            }
            else {
                this.setLayerSource(new ol.source.ImageWMS({
                    url: this.get("url"),
                    attributions: this.get("olAttribution"),
                    params: params,
                    crossOrigin: "anonymous"
                }));
            }
            this.registerErrorListener();
            this.registerLoadingListeners();
        },

        /**
         * [createLayer description]
         * @return {[type]} [description]
         */
        createLayer: function () {
            var layerobjects = {
                id: this.getId(),
                source: this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                legendURL: this.get("legendURL"),
                routable: this.get("routable"),
                gfiTheme: this.get("gfiTheme"),
                infoFormat: this.get("infoFormat")
            };

            if (this.getSingleTile() !== true) {
                this.setLayer(new ol.layer.Tile(layerobjects));
            }
            else {
                this.setLayer(new ol.layer.Image(layerobjects));
            }
        },

        /**
         * Wenn der Parameter "legendURL" leer ist, wird er auf GetLegendGraphic gesetzt.
         * @return {[type]} [description]
         */
        createLegendURL: function () {
            if (this.get("legendURL") === "" || this.get("legendURL") === undefined) {
                var layerNames = this.get("layers").split(","),
                    legendURL = [];

                if (layerNames.length === 1) {
                    legendURL.push(this.get("url") + "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + this.get("layers"));
                }
                else if (layerNames.length > 1) {
                    _.each(layerNames, function (layerName) {
                        legendURL.push(this.get("url") + "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + layerName);
                    }, this);
                }
                this.set("legendURL", legendURL);
            }
        },

        /**
         * Register LayerLoad-Events
         */
        registerLoadingListeners: function () {
            if (this.getLayerSource() instanceof ol.source.TileWMS) {
                this.registerTileWMSLoadEvents();
            }
            else if (this.getLayerSource() instanceof ol.source.ImageWMS) {
                this.registerImageLoadEvents();
            }
        },

        registerImageLoadEvents: function () {
            this.getLayerSource().on("imageloadend", function () {
                this.set("loadingParts", this.get("loadingParts") - 1);
            });

            this.getLayerSource().on("imageloadstart", function () {
                var startval = this.get("loadingParts") ? this.get("loadingParts") : 0;

                this.set("loadingParts", startval + 1);
            });

            this.getLayerSource().on("change:loadingParts", function (obj) {
                if (obj.oldValue > 0 && this.get("loadingParts") === 0) {
                    this.dispatchEvent("wmsloadend");
                    this.unset("loadingParts", {silent: true});
                }
                else if (obj.oldValue === undefined && this.get("loadingParts") === 1) {
                    this.dispatchEvent("wmsloadstart");
                }
            });
        },

        registerTileWMSLoadEvents: function () {
            this.getLayerSource().on("tileloadend", function () {
                this.set("loadingParts", this.get("loadingParts") - 1);
            });

            this.getLayerSource().on("tileloadstart", function () {
                var startval = this.get("loadingParts") ? this.get("loadingParts") : 0;

                this.set("loadingParts", startval + 1);
            });

            this.getLayerSource().on("change:loadingParts", function (obj) {
                if (obj.oldValue > 0 && this.get("loadingParts") === 0) {
                    this.dispatchEvent("wmsloadend");
                    this.unset("loadingParts", {silent: true});
                }
                else if (obj.oldValue === undefined && this.get("loadingParts") === 1) {
                    this.dispatchEvent("wmsloadstart");
                }
            });
        },

        /**
         * Register LayerLoad-Events
         */
        registerErrorListener: function () {
            if (this.getLayerSource() instanceof ol.source.TileWMS) {
                this.registerTileloadError();
            }
            else if (this.getLayerSource() instanceof ol.source.ImageWMS) {
                this.registerImageloadError();
            }
        },

        registerTileloadError: function () {
            this.getLayerSource().on("tileloaderror", function () {
            }, this);
        },

        registerImageloadError: function () {
            this.getLayerSource().on("imageloaderror", function () {
            }, this);
        },

        updateSourceSLDBody: function () {
            this.getLayer().getSource().updateParams({SLD_BODY: this.get("SLDBody"), STYLES: this.get("paramStyle")});
        },

        setInfoFormat: function (value) {
            this.set("infoFormat", value);
        },

        /**
         * [getLayers description]
         * @return {[type]} [description]
         */
        getLayers: function () {
            return this.get("layers");
        },

        getSingleTile: function () {
            return this.get("singleTile");
        },

        getInfoFormat: function () {
            return this.get("infoFormat");
        },

        getGfiUrl: function () {
            var resolution = Radio.request("MapView", "getResolution").resolution,
                projection = Radio.request("MapView", "getProjection"),
                coordinate = Radio.request("GFI", "getCoordinate");

            return this.getLayerSource().getGetFeatureInfoUrl(coordinate, resolution, projection, {INFO_FORMAT: this.getInfoFormat(), FEATURE_COUNT: this.get("featureCount")});
        }
    });

    return WMSLayer;
});
