import Layer from "./model";
import WMTS, {optionsFromCapabilities} from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import TileLayer from "ol/layer/Tile";
import {DEVICE_PIXEL_RATIO} from "ol/has";
import {get as getProjection} from "ol/proj";
import {getWidth} from "ol/extent";
import WMTSCapabilities from "ol/format/WMTSCapabilities";

const WMTSLayer = Layer.extend(/** @lends WMTSLayer.prototype */{
    defaults: Object.assign({}, Layer.prototype.defaults, {
        infoFormat: "text/xml",
        supported: ["2D", "3D"],
        showSettings: true
    }),

    /**
     * @class WMTSLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String} infoFormat="text/xml Format of provided information."
     * @property {String[]} supported=["2D", "3D"] Supported map modes.
     * @property {Boolean} showSettings=true Flag if settings selectable.
     * @listens Layer#RadioRequestVectorLayerGetFeatures
     */
    initialize: function () {
        this.checkForScale(Radio.request("MapView", "getOptions"));
        this.listenTo(this, "change:layerSource", () => {
            const hasOptionsFromCapabilities = Boolean(this.get("optionsFromCapabilities"));

            if (hasOptionsFromCapabilities) {
                this.updateLayerSource();
            }
            if (hasOptionsFromCapabilities && this.get("layerSource").getState() === "ready") {
                // state of optionsFromCapabilities wmts source is ready, trigger removeloadinglayer
                Radio.trigger("Map", "removeLoadingLayer");
            }
        });
        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }
    },

    /**
     * Creates the LayerSource for this WMTSLayer.
     *
     * @returns {void}
     */
    createLayerSource: function () {
        if (this.get("optionsFromCapabilities") === undefined) {
            const projection = getProjection(this.get("coordinateSystem")),
                extent = projection.getExtent(),
                style = this.get("style"),
                format = this.get("format"),
                wrapX = this.get("wrapX") ? this.get("wrapX") : false,
                urls = this.get("urls"),
                size = getWidth(extent) / parseInt(this.get("tileSize"), 10),
                resLength = parseInt(this.get("resLength"), 10),
                resolutions = new Array(resLength),
                matrixIds = new Array(resLength);

            this.generateArrays(resolutions, matrixIds, resLength, size);

            this.setLayerSource(new WMTS({
                projection: projection,
                attributions: this.get("olAttribution"),
                tileGrid: new WMTSTileGrid({
                    origin: this.get("origin"),
                    resolutions: resolutions,
                    matrixIds: matrixIds,
                    tileSize: this.get("tileSize")
                }),
                tilePixelRatio: DEVICE_PIXEL_RATIO,
                urls: urls,
                matrixSet: this.get("tileMatrixSet"),
                layer: this.get("layers"),
                format: format,
                style: style,
                version: this.get("version"),
                transparent: this.get("transparent").toString(),
                wrapX: wrapX,
                requestEncoding: this.get("requestEncoding")
            }));
        }
        else {
            const layerIdentifier = this.get("layers"),
                url = this.get("capabilitiesUrl"),
                matrixSet = this.get("tileMatrixSet"),
                capabilitiesOptions = {
                    layer: layerIdentifier
                };

            // use the matrixSet (if defined) for optionsFromCapabilities
            // else look for a tilematrixset in epsg:3857
            if (matrixSet && matrixSet.length > 0) {
                capabilitiesOptions.matrixSet = matrixSet;
            }
            else {
                capabilitiesOptions.projection = "EPSG:3857";
            }

            this.fetchWMTSCapabilities(url)
                .then((result) => {
                    const options = optionsFromCapabilities(result, capabilitiesOptions);

                    if (options !== null) {
                        const source = new WMTS(options);

                        this.set("options", options);
                        this.setLayerSource(source);
                        Promise.resolve();
                    }
                    else {
                        // reject("Cannot get options from WMTS-Capabilities");
                        throw new Error("Cannot get options from WMTS-Capabilities");
                    }
                })
                .catch((error) => {
                    this.removeLayer();
                    // remove layer from project completely
                    Radio.trigger("Parser", "removeItem", this.get("id"));
                    // refresh layer tree
                    Radio.trigger("Util", "refreshTree");
                    if (error === "Fetch error") {
                        // error message has already been printed earlier
                        return;
                    }
                    this.showErrorMessage(error, this.get("name"));
                });
        }
    },

    /**
     * Generates resolutions and matrixIds arrays for the WMTS LayerSource.
     *
     * @param {Array} resolutions The resolutions array for the LayerSource.
     * @param {Array} matrixIds The matrixIds array for the LayerSource.
     * @param {Number} length The length of the given arrays.
     * @param {Number} size The tileSize depending on the extent.
     * @returns {void}
     */
    generateArrays: function (resolutions, matrixIds, length, size) {
        for (let i = 0; i < length; ++i) {
            resolutions[i] = size / Math.pow(2, i);
            matrixIds[i] = i;
        }
    },

    /**
     * Fetch the WMTS-GetCapabilities document and parse it
     * @param {string} url url to fetch
     * @returns {promise} promise resolves to parsed WMTS-GetCapabilities object
     */
    fetchWMTSCapabilities: function (url) {
        return fetch(url)
            .then((result) => {
                if (!result.ok) {
                    throw Error(result.statusText);
                }
                return result.text();
            })
            .then(result => {
                const parser = new WMTSCapabilities();

                return parser.read(result);
            })
            .catch(function (error) {
                const errorMessage = " WMTS-Capabilities fetch Error: " + error;

                this.showErrorMessage(errorMessage, this.get("name"));
                return Promise.reject("Fetch error");
            }.bind(this));
    },

    /**
     * shows error message when WMTS-GetCapabilities cannot be parsed
     * @param {string} errorMessage error message
     * @param {string} layerName layerName
     * @returns {void}
     */
    showErrorMessage: (errorMessage, layerName) => {
        Radio.trigger("Alert", "alert", {
            text: "Layer " + layerName + ": " + errorMessage,
            kategorie: "alert-danger"
        });
    },

    /**
     * Creates the WMTSLayer.
     *
     * @returns {void}
     */
    createLayer: function () {
        this.setLayer(new TileLayer({
            id: this.get("id"),
            source: this.get("layerSource"),
            name: this.get("name"),
            typ: this.get("typ"),
            legendURL: this.get("legendURL"),
            infoFormat: this.get("infoFormat")
        }));
    },

    /**
     * If no legendURL is set an Error is written on the console.
     * For the OptionsFromCapabilities way:
     * If legend is empty, WMTS-Capabilities will be searched for a legendURL (OGC Standard)
     * If a legend is found, legend will be rebuild
     *
     * @returns {void}
     */
    createLegend: function () {
        let legend = this.get("legend");
        const capabilitiesUrl = this.get("capabilitiesUrl");

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

        if ((this.get("optionsFromCapabilities") === undefined) && (legend === true)) {
            console.error("WMTS: No legendURL is specified for the layer!");
        }

        else if (this.get("optionsFromCapabilities") && !legend) {
            this.fetchWMTSCapabilities(capabilitiesUrl)
                .then(function (result) {
                    result.Contents.Layer.forEach(function (layer) {
                        if (layer.Identifier === this.get("layers")) {
                            const getLegend = Radio.request("Util", "searchNestedObject", layer, "LegendURL");

                            if (getLegend !== null && getLegend !== undefined) {
                                legend = getLegend.Legend[0].href;

                                this.setLegend(legend);

                                // rebuild Legend
                                Radio.trigger("Legend", "setLayerList");
                            }
                            else {
                                this.setLegend(null);
                                console.warn("no legend url found for layer " + this.get("layers"));
                            }

                        }
                    }.bind(this));
                }.bind(this))
                .catch(function (error) {
                    if (error === "Fetch error") {
                        // error message has already been printed earlier
                        return;
                    }
                    this.showErrorMessage(error, this.get("name"));
                }.bind(this));
        }

    },

    /**
     * Registers the LayerLoad-Events.
     * These are dispatched to core/map, which then either adds or removes a Loading Layer.
     *
     * @returns {void}
     */
    registerLoadingListeners: function () {
        this.get("layerSource").on("tileloadend", function () {
            this.set("loadingParts", this.get("loadingsParts") - 1);
        });

        this.get("layerSource").on("tileloadstart", function () {
            const tmp = this.get("loadingParts") ? this.get("loadingParts") : 0;

            this.set("loadingParts", tmp + 1);
        });

        this.get("layerSource").on("change:loadingParts", function (val) {
            if (val.oldValue > 0 && this.get("loadingParts") === 0) {
                this.dispatchEvent("wmtsloadend");
                this.unset("loadingParts", {silent: true});
            }
            else if (val.oldValue === undefined && this.get("loadingParts") === 1) {
                this.dispatchEvent("wmtsloadstart");
            }
        });
    },

    /**
     * Reigsters the LayerLoad-Event for Errors.
     *
     * @returns {void}
     */
    registerErrorListener: function () {
        this.registerTileloadError();
    },

    /**
     * If the WMTS-Layer has an extent defined, then this is returned.
     * Else, the extent of the projection is returned.
     *
     * @returns {Array} - The extent of the Layer.
     */
    getExtent: function () {
        const projection = getProjection(this.get("coordinateSystem"));

        if (this.has("extent")) {
            return this.get("extent");
        }

        return projection.getExtent();
    },

    /**
     * Sets the infoFormat to the given Parameter.
     *
     * @param {*} infoFormat - The value for the infoFormat to be set.
     * @returns {void}
     */
    setInfoFormat: function (infoFormat) {
        this.set("infoFormat", infoFormat);
    },

    /**
     * Returns the WMTS-Layer.
     *
     * @returns {Object} - The WMTS-Layer
     */
    getLayer: function () {
        return this.get("layer");
    }
});

export default WMTSLayer;
