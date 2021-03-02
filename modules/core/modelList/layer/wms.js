import Layer from "./model";
import TileWMS from "ol/source/TileWMS.js";
import TileGrid from "ol/tilegrid/TileGrid.js";
import ImageWMS from "ol/source/ImageWMS.js";
import {Image, Tile} from "ol/layer.js";

const WMSLayer = Layer.extend({
    defaults: function () {
        // extended die Layer defaults by value
        return Object.assign(Layer.prototype.defaults, {
            infoFormat: "text/xml",
            gfiAsNewWindow: null,
            // A change of the CACHEID initiates a reload of the service by openlayers and bypasses the browser cache.
            cacheId: parseInt(Math.random() * 10000000, 10),
            supported: ["2D", "3D"],
            showSettings: true,
            extent: null,
            isSecured: false,
            notSupportedFor3D: ["1747", "1749", "1750", "9822", "12600", "9823", "1752", "9821", "1750", "1751", "12599", "2297"],
            useProxy: false
        });
    },

    initialize: function () {

        this.checkForScale(Radio.request("MapView", "getOptions"));

        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }

        this.listenTo(this, {
            "change:SLDBody": this.updateSourceSLDBody
        });

        // Hack for services that do not support EPSG:4326
        if (this.get("notSupportedFor3D").includes(this.get("id"))) {
            this.set("supported", ["2D"]);
        }
    },

    /**
     * [createLayerSource description]
     * @return {void}
     */
    createLayerSource: function () {
        let params,
            source;

        params = {
            CACHEID: this.get("cacheId"),
            LAYERS: this.get("layers"),
            FORMAT: this.get("format") === "nicht vorhanden" ? "image/png" : this.get("format"),
            VERSION: this.get("version"),
            TRANSPARENT: this.get("transparent").toString()
        };

        if (this.get("styles") && this.get("styles") !== "" && this.get("styles") !== "nicht vorhanden") {
            params = Object.assign(params, {
                STYLES: this.get("styles")
            });
        }
        this.set("tileloaderror", false);

        if (this.get("singleTile") !== true) {
            // TileWMS can be cached
            this.set("tileCountloaderror", 0);
            this.set("tileCount", 0);
            source = new TileWMS({
                url: this.get("url"),
                attributions: this.get("olAttribution"),
                gutter: this.get("gutter"),
                params: params,
                tileGrid: new TileGrid({
                    resolutions: Radio.request("MapView", "getResolutions"),
                    origin: [
                        442800,
                        5809000
                    ],
                    tileSize: parseInt(this.get("tilesize"), 10)
                })
            });

            // wms_webatlasde
            if (this.get("url").indexOf("wms_webatlasde") !== -1) {
                if (this.get("tileloaderror") === false) {
                    this.set("tileloaderror", true);
                    source.on("tileloaderror", function () {
                        if (!navigator.cookieEnabled) {
                            Radio.trigger("Alert", "alert", {text: "<strong>Bitte erlauben sie Cookies, damit diese Hintergrundkarte geladen werden kann.</strong>", kategorie: "alert-warning"});
                        }
                    });
                }
            }

            this.setLayerSource(source);
        }
        else {
            // ImageWMS can not be cached
            this.setLayerSource(new ImageWMS({
                url: this.get("url"),
                attributions: this.get("olAttribution"),
                params: params
            }));
        }
    },

    /**
     * [createLayer description]
     * @return {void}
     */
    createLayer: function () {
        const layerobjects =
            {
                id: this.get("id"),
                source: this.get("layerSource"),
                name: this.get("name"),
                typ: this.get("typ"),
                legendURL: this.get("legendURL"),
                gfiTheme: this.get("gfiTheme"),
                // gfiIconPath: this.get("gfiIconPath"),
                gfiAttributes: this.get("gfiAttributes"),
                infoFormat: this.get("infoFormat"),
                gfiAsNewWindow: this.get("gfiAsNewWindow"),
                featureCount: this.get("featureCount")
            };

        if (this.get("singleTile") !== true) {
            this.setLayer(new Tile(layerobjects));
        }
        else {
            this.setLayer(new Image(layerobjects));
        }
        this.createLegend();
    },

    /**
     * If the parameter "legendURL" is empty, it is set to GetLegendGraphic.
     * @return {void}
     */
    createLegend: function () {
        const version = this.get("version");
        let legend = this.get("legend");

        /**
         * @deprecated in 3.0.0
         */
        if (this.get("legendURL")) {
            if (this.get("legendURL") === "") {
                legend = true;
            }
            else if (this.get("legendURL") === "ignore") {
                legend = false;
            }
            else {
                legend = this.get("legendURL");
            }
        }

        if (Array.isArray(legend)) {
            this.setLegend(legend);
        }
        else if (legend === true) {
            const layerNames = this.get("layers").split(","),
                legends = [];

            if (layerNames.length === 1) {
                legends.push(encodeURI(this.get("url") + "?VERSION=" + version + "&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + this.get("layers")));
            }
            else if (layerNames.length > 1) {
                layerNames.forEach(layerName => {
                    legends.push(encodeURI(this.get("url") + "?VERSION=" + version + "&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + layerName));
                });
            }
            this.setLegend(legends);
        }
        else if (typeof legend === "string") {
            this.setLegend([legend]);
        }
    },

    /**
     * Register LayerLoad-Events
     * @returns {void}
     */
    registerLoadingListeners: function () {
        if (this.get("layerSource") instanceof TileWMS) {
            this.registerTileWMSLoadEvents();
        }
        else if (this.get("layerSource") instanceof ImageWMS) {
            this.registerImageLoadEvents();
        }
    },

    registerImageLoadEvents: function () {
        this.get("layerSource").on("imageloadend", function () {
            this.set("loadingParts", this.get("loadingParts") - 1);
        });

        this.get("layerSource").on("imageloadstart", function () {
            const startval = this.get("loadingParts") ? this.get("loadingParts") : 0;

            this.set("loadingParts", startval + 1);
        });

        this.get("layerSource").on("change:loadingParts", function (obj) {
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
        this.get("layerSource").on("tileloadend", function () {
            this.set("loadingParts", this.get("loadingParts") - 1);
        });

        this.get("layerSource").on("tileloadstart", function () {
            const startval = this.get("loadingParts") ? this.get("loadingParts") : 0;

            this.set("loadingParts", startval + 1);
        });

        this.get("layerSource").on("change:loadingParts", function (obj) {
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
     * @returns {void}
     */
    registerErrorListener: function () {
        if (this.get("layerSource") instanceof TileWMS) {
            this.registerTileloadError();
        }
        else if (this.get("layerSource") instanceof ImageWMS) {
            this.registerImageloadError();
        }
    },
    updateSupported: function () {
        if (this.getSingleTile()) {
            this.set("supported", ["2D"]);
        }
        else {
            this.set("supported", ["2D", "3D"]);
        }
    },
    getExtent: function () {
        if (this.has("extent")) {
            return this.get("extent");
        }
        return Radio.request("MapView", "getExtent");
    },

    updateSourceSLDBody: function () {
        this.get("layer").getSource().updateParams({SLD_BODY: this.get("SLDBody"), STYLES: this.get("paramStyle")});
    },

    /**
     * Lädt den WMS neu, indem ein Parameter verändert wird.
     * @returns {void}
     */
    updateSource: function () {
        this.newCacheId();

        this.get("layer").getSource().updateParams({CACHEID: this.get("cacheId")});
    },

    setInfoFormat: function (value) {
        this.set("infoFormat", value);
    },

    /**
     * [getLayers description]
     * @return {Object[]} [description]
     */
    getLayers: function () {
        return this.get("layers");
    },

    /**
     * Gets the gfi url from the layers source.
     * @returns {String} - The created getFeature info url.
     */
    getGfiUrl: function () {
        const resolution = Radio.request("MapView", "getOptions").resolution,
            projection = Radio.request("MapView", "getProjection"),
            coordinate = Radio.request("GFI", "getCoordinate");

        return this.get("layerSource").getFeatureInfoUrl(coordinate, resolution, projection, {INFO_FORMAT: this.get("infoFormat"), FEATURE_COUNT: this.get("featureCount"), STYLES: "", SLD_BODY: undefined});
    },

    /*
    * random setter for cacheId
    * @returns {void}
    */
    newCacheId: function () {
        this.set("cacheId", parseInt(Math.random() * 10000000, 10));
    },

    /**
     * setter for gfiAsNewWindow
     * @param {Object} value see doc/config.json.md for more information
     * @param {String} [value.name="_blank"] the browsing context or the target attribute to open the window (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
     * @param {String} [value.specs=""] a comma-separated list of items - the setup to open the window with (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
     * @returns {Void}  -
     */
    setGfiAsNewWindow: function (value) {
        this.set("gfiAsNewWindow", value);
    },

    /**
     * getter for gfiAsNewWindow
     * @returns {Object}  see setGfiAsNewWindow above or doc/config.json.md for more information
     */
    getGfiAsNewWindow: function () {
        return this.get("gfiAsNewWindow");
    }

});

export default WMSLayer;
