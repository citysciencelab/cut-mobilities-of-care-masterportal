import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Overlay from "ol/Overlay.js";
import {Stroke, Style, Fill} from "ol/style.js";
import {WKT} from "ol/format.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point";

const MapMarkerModel = Backbone.Model.extend(/** @lends MapMarkerModel.prototype */{
    defaults: {
        marker: {},
        polygon: new VectorLayer({
            name: "mapMarker",
            source: new VectorSource(),
            alwaysOnTop: true,
            visible: false,
            style: new Style({
                stroke: new Stroke({
                    color: "#08775f",
                    lineDash: [8],
                    width: 4
                }),
                fill: new Fill({
                    color: [8, 119, 95, 0.3]
                })
            })
        }),
        wkt: "",
        markers: [],
        zoomLevel: 7,
        type: "Overlay",
        mapMarkerStyleId: "mapMarkerStyle"
    },

    /**
     * @class MapMarkerModel
     * @description Model for MapMarker and Highlighting
     * @extends Backbone.Model
     * @memberof Core.MapMarker
     * @constructs
     * @param {Object} marker={} The marker. May be an olOverlay or an olVectorLayer. Depends on config.
     * @param {VectorLayer} polygon The polygon vector layer.
     * @param {String} wkt="" The wkt.
     * @param {Object[]} markers=[] An array containing multiple markers.
     * @param {Number} zoomLevel=7 The zoomLevel for marker.
     * @param {String} type="Overlay". The type of the marker, can be "Overlay" or "Layer".
     * @param {String} mapMarkerStyleId="mapMarkerStyle". The styleId of the mapMarker. used for type="Layer".
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapAddLayerToIndex
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     */
    initialize: function () {
        let searchConf = Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"});
        const parcelSearchConf = Radio.request("Parser", "getItemsByAttributes", {id: "parcelSearch"})[0],
            type = this.get("type");

        searchConf = searchConf[0] !== undefined && searchConf[0].hasOwnProperty("attr") ? searchConf[0].attr : {};

        Radio.trigger("Map", "addLayerToIndex", [this.get("polygon"), Radio.request("Map", "getLayers").getArray().length]);

        if (searchConf.hasOwnProperty("zoomLevel")) {
            this.setZoomLevel(searchConf.zoomLevel);
        }
        if (parcelSearchConf && parcelSearchConf.styleId) {
            this.setMapMarkerPolygonStyle(parcelSearchConf.styleId);
        }
        this.createMarker(type);
    },

    /**
     * Creates the mapMarker based on the configured type.
     * @param {String} type Type of Marker coming from Config.js. Possible values are "Overlay" or "Layer".
     * @returns {void}
     */
    createMarker: function (type) {
        if (type === "Overlay") {
            this.createOverlayMarker();
        }
        else if (type === "Layer") {
            this.createLayerMarker();
        }
        else {
            console.error("unknown type: " + type + " for mapMarker! Creating default overlayMarker");
            this.setType("Overlay");
            this.createOverlayMarker();
        }
    },

    /**
     * Creates the overlayMarker.
     * @fires Core#RadioTriggerMapAddOverlay
     * @returns {void}
     */
    createOverlayMarker: function () {
        const overlay = new Overlay({
            positioning: "bottom-center",
            stopEvent: false
        });

        this.setMarker(overlay);
        Radio.trigger("Map", "addOverlay", overlay);
    },

    /**
     * Creates the layerMarker.
     * @fires Core#RadioTriggerMapAddLayerToIndex
     * @returns {void}
     */
    createLayerMarker: function () {
        const layer = new VectorLayer({
            name: "markerAsPointLayer",
            source: new VectorSource({
                features: [new Feature({
                    name: "pointMarker",
                    geometry: new Point([0, 0])
                })
                ]
            }),
            alwaysOnTop: true,
            visible: true
        });

        this.setMapMarkerPointStyle(layer, this.get("mapMarkerStyleId"));
        this.setMarker(layer);
        Radio.trigger("Map", "addLayerToIndex", [layer, Radio.request("Map", "getLayers").getArray().length]);
    },

    /**
     * Sets the point style of the marker if its type is "Layer".
     * @param {VectorLayer} markerLayer The markerLayer.
     * @param {String} styleId  The style id.
     * @returns {void}
     */
    setMapMarkerPointStyle: function (markerLayer, styleId) {
        const styleListModel = Radio.request("StyleList", "returnModelById", styleId),
            feature = markerLayer.getSource().getFeatures()[0];

        if (styleListModel) {
            markerLayer.setStyle(styleListModel.createStyle(feature, false));
        }
    },

    /**
     * Returns the feature from wkt.
     * @returns {Feature} - The feature from wkt.
     */
    getFeature: function () {
        const format = new WKT(),
            feature = format.readFeature(this.get("wkt"));

        return feature;
    },

    /**
     * Returns the extent of the feature.
     * @returns {ol/Extent} - the extent.
     */
    getExtent: function () {
        const feature = this.getFeature(),
            extent = feature.getGeometry().getExtent();

        return extent;
    },

    /**
     * creates the center coordinate from a given extent
     * @param {Number[]} extent - extent
     * @returns {Number[]} center coordinate
     */
    getCenterFromExtent: function (extent) {
        const deltaY = extent[2] - extent[0],
            deltaX = extent[3] - extent[1],
            centerY = extent[0] + deltaY / 2,
            centerX = extent[1] + deltaX / 2;

        return [centerY, centerX];
    },

    /**
     * Help function for determining a feature with textual description
     * @param  {string} type Geometrietype
     * @param  {number[]} geom Array with coordinate values
     * @returns {string} wkt WellKnownText-Geom
     */
    getWKTGeom: function (type, geom) {
        let wkt,
            regExp;

        if (type === "POLYGON") {
            wkt = type + "((";
            geom.forEach(function (element, index, list) {
                if (index % 2 === 0) {
                    wkt += element + " ";
                }
                else if (index === list.length - 1) {
                    wkt += element + "))";
                }
                else {
                    wkt += element + ", ";
                }
            });
        }
        else if (type === "POINT") {
            wkt = type + "(";
            wkt += geom[0] + " " + geom[1];
            wkt += ")";
        }
        else if (type === "MULTIPOLYGON") {
            wkt = type + "(((";
            geom.forEach(function (element, index) {

                geom[index].forEach(function (coord, index2, list) {
                    if (index2 % 2 === 0) {
                        wkt += coord + " ";
                    }
                    else if (index2 === list.length - 1) {
                        wkt += coord + "))";
                    }
                    else {
                        wkt += coord + ", ";
                    }
                });
                if (index === geom.length - 1) {
                    wkt += ")";
                }
                else {
                    wkt += ",((";
                }
            });
            regExp = new RegExp(", \\)\\?\\(", "g");
            wkt = wkt.replace(regExp, "),(");
        }
        return wkt;
    },

    /**
     * Creates a polygon around the WKT feature
     * @return {void}
     */
    showFeature: function () {
        const feature = this.getFeature();

        this.get("polygon").getSource().addFeature(feature);
        this.get("polygon").setVisible(true);
    },

    /**
     * Deletes the polygon
     * @return {void}
     */
    hideFeature: function () {
        this.get("polygon").getSource().clear();
        this.get("polygon").setVisible(false);
    },

    /**
     * SetMapMarkerPolygonStyle styles the mapMArker polygon via the style model from the stylelist.
     * @param {string} mapMarkerStyleId styleId for the mapMarker polygon to find the style model
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @return {void}
     */
    setMapMarkerPolygonStyle: function (mapMarkerStyleId) {
        const styleListModel = Radio.request("StyleList", "returnModelById", mapMarkerStyleId);

        if (styleListModel) {
            this.get("polygon").setStyle(styleListModel.createStyle(this.get("polygon"), false));
        }
    },

    /**
     * setter for zoomLevel
     * @param {*} value todo
     * @returns {void}
     */
    setZoomLevel: function (value) {
        this.set("zoomLevel", value);
    },

    /**
     * setter for wkt
     * @param {*} type todo
     * @param {*} geom todo
     * @returns {void}
     */
    setWkt: function (type, geom) {
        const value = this.getWKTGeom(type, geom);

        this.set("wkt", value);
    },

    /**
     * setter for marker
     * @param {*} value todo
     * @returns {void}
     */
    setMarker: function (value) {
        this.set("marker", value);
    },

    /**
     * setter for markers
     * @param {*} value todo
     * @returns {void}
     */
    setMarkers: function (value) {
        this.set("markers", value);
    },

    /**
     * setter for polygon
     * @param {*} value todo
     * @returns {void}
     */
    setPolygon: function (value) {
        this.set("polygon", value);
    },

    /**
     * setter for style
     * @param {*} value todo
     * @returns {void}
     */
    setStyle: function (value) {
        this.set("style", value);
    },

    /**
     * setter for projectionFromParamUrl
     * @param {*} value todo
     * @returns {void}
     */
    setProjectionFromParamUrl: function (value) {
        this.set("projectionFromParamUrl", value);
    },

    /**
     * setter for startMarker
     * @param {*} value todo
     * @returns {void}
     */
    setMarkerFromParamUrl: function (value) {
        this.set("startMarker", value);
    },

    /**
     * Setter for attribute "type".
     * @param {String} value Type of mapMarker.
     * @returns {void}
     */
    setType: function (value) {
        this.set("type", value);
    }

});

export default MapMarkerModel;
