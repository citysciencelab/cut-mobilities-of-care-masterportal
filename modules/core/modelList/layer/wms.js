import Layer from "./model";
import TileWMS from "ol/source/TileWMS.js";
import TileGrid from "ol/tilegrid/TileGrid.js";
import ImageWMS from "ol/source/ImageWMS.js";
import {Image, Tile} from "ol/layer.js";

const WMSLayer = Layer.extend({
    defaults: function () {
        // extended die Layer defaults by value
        return _.extend(_.result(Layer.prototype, "defaults"), {
            infoFormat: "text/xml",
            // Eine Veränderung der SESSIONID initiiert von openlayers ein reload des Dienstes und umgeht den Browser-Cache
            sessionId: _.random(9999999)
        });
    },

    initialize: function () {
        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }

        this.listenTo(this, {
            "change:SLDBody": this.updateSourceSLDBody
        });
    },

    /**
     * [createLayerSource description]
     * @return {[type]} [description]
     */
    createLayerSource: function () {
        var params,
            source;

        params = {
            SESSIONID: this.get("sessionId"),
            LAYERS: this.get("layers"),
            FORMAT: this.get("format") === "nicht vorhanden" ? "image/png" : this.get("format"),
            VERSION: this.get("version"),
            TRANSPARENT: this.get("transparent").toString()
        };

        if (this.get("styles") && this.get("styles") !== "" && this.get("styles") !== "nicht vorhanden") {
            params = _.extend(params, {
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
        // this.registerErrorListener();
        // this.registerLoadingListeners();
    },

    /**
     * [createLayer description]
     * @return {[type]} [description]
     */
    createLayer: function () {
        var layerobjects = {
            id: this.get("id"),
            source: this.get("layerSource"),
            name: this.get("name"),
            typ: this.get("typ"),
            legendURL: this.get("legendURL"),
            routable: this.get("routable"),
            gfiTheme: this.get("gfiTheme"),
            infoFormat: this.get("infoFormat")
        };

        if (this.get("singleTile") !== true) {
            this.setLayer(new Tile(layerobjects));
        }
        else {
            this.setLayer(new Image(layerobjects));
        }
    },

    /**
     * Wenn der Parameter "legendURL" leer ist, wird er auf GetLegendGraphic gesetzt.
     * @return {[type]} [description]
     */
    createLegendURL: function () {
        var layerNames,
            legendURL = [],
            version = this.get("version");

        if (this.get("legendURL") === "" || this.get("legendURL") === undefined) {
            layerNames = this.get("layers").split(",");

            if (layerNames.length === 1) {
                legendURL.push(this.get("url") + "?VERSION=" + version + "&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + this.get("layers"));
            }
            else if (layerNames.length > 1) {
                _.each(layerNames, function (layerName) {
                    legendURL.push(this.get("url") + "?VERSION=" + version + "&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=" + layerName);
                }, this);
            }
            this.set("legendURL", legendURL);
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
            var startval = this.get("loadingParts") ? this.get("loadingParts") : 0;

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
            var startval = this.get("loadingParts") ? this.get("loadingParts") : 0;

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

    // registerTileloadError: function () {
    //     this.get("layerSource").on("tileloaderror", function () {
    //     }, this);
    // },

    // registerImageloadError: function () {
    //     this.get("layerSource").on("imageloaderror", function () {
    //     }, this);
    // },

    updateSourceSLDBody: function () {
        this.get("layer").getSource().updateParams({SLD_BODY: this.get("SLDBody"), STYLES: this.get("paramStyle")});
    },

    /**
     * Lädt den WMS neu, indem ein Parameter verändert wird.
     * @returns {void}
     */
    updateSource: function () {
        this.newSessionId();

        this.get("layer").getSource().updateParams({SESSIONID: this.get("sessionId")});
    },

    setInfoFormat: function (value) {
        this.set("infoFormat", value);
    },

    /**
    * Prüft anhand der Scale ob der Layer sichtbar ist oder nicht
    * @param {object} options -
    * @returns {void}
    **/
    checkForScale: function (options) {
        if (parseFloat(options.scale, 10) <= this.get("maxScale") && parseFloat(options.scale, 10) >= this.get("minScale")) {
            this.setIsOutOfRange(false);
        }
        else {
            this.setIsOutOfRange(true);
        }
    },

    /**
     * [getLayers description]
     * @return {[type]} [description]
     */
    getLayers: function () {
        return this.get("layers");
    },

    getGfiUrl: function () {
        var resolution = Radio.request("MapView", "getOptions").resolution,
            projection = Radio.request("MapView", "getProjection"),
            coordinate = Radio.request("GFI", "getCoordinate");

        return this.get("layerSource").getGetFeatureInfoUrl(coordinate, resolution, projection, {INFO_FORMAT: this.get("infoFormat"), FEATURE_COUNT: this.get("featureCount")});
    },

    /*
    * random setter for sessionId
    * @returns {void}
    */
    newSessionId: function () {
        this.set("sessionId", _.random(9999999));
    }
});

export default WMSLayer;
