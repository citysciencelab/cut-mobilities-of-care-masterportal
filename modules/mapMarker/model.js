import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Overlay from "ol/Overlay.js";
import {Stroke, Style, Fill} from "ol/style.js";
import {WKT} from "ol/format.js";

const MapMarkerModel = Backbone.Model.extend(/** @lends MapMarkerModel.prototype */{
    defaults: {
        marker: new Overlay({
            positioning: "bottom-center",
            stopEvent: false
        }),
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
        zoomLevel: 7
    },

    /**
     * @class MapMarkerModel
     * @description Model for MapMarker and Highlighting
     * @extends Backbone.Model
     * @memberOf Core.MapMarker
     * @constructs
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapAddLayerToIndex
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     */
    initialize: function () {
        var searchConf = Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"}),
            parcelSearchConf = Radio.request("Parser", "getItemsByAttributes", {id: "parcelSearch"})[0];

        searchConf = searchConf[0] !== undefined && searchConf[0].hasOwnProperty("attr") ? searchConf[0].attr : {};

        Radio.trigger("Map", "addOverlay", this.get("marker"));
        Radio.trigger("Map", "addLayerToIndex", [this.get("polygon"), Radio.request("Map", "getLayers").getArray().length]);

        if (_.has(searchConf, "zoomLevel")) {
            this.setZoomLevel(searchConf.zoomLevel);
        }
        if (parcelSearchConf && parcelSearchConf.styleId) {
            this.setMapMarkerPolygonStyle(parcelSearchConf.styleId);
        }
    },

    /**
     * todo
     * @returns {*} todo
     */
    getFeature: function () {
        var format = new WKT(),
            feature = format.readFeature(this.get("wkt"));

        return feature;
    },

    /**
     * todo
     * @returns {*} todo
     */
    getExtent: function () {
        var feature = this.getFeature(),
            extent = feature.getGeometry().getExtent();

        return extent;
    },

    /**
     * creates the center coordinate from a given extent
     * @param {Number[]} extent - extent
     * @returns {Number[]} center coordinate
     */
    getCenterFromExtent: function (extent) {
        var deltaY = extent[2] - extent[0],
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
        var wkt,
            split,
            regExp;

        if (type === "POLYGON") {
            wkt = type + "((";
            _.each(geom, function (element, index, list) {
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
            _.each(geom, function (element, index) {
                split = geom[index].split(" ");

                _.each(split, function (coord, index2, list) {
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
     * Converts coordinates from goven array to float values.
     * The reason is Open layers does not like coordinates of type string!
     * The brackets are removed from the coordinates,
     * these are present at some coordinates due to the decomposition from the WKT format.
     * @param {Array} coord coordinates
     * @returns {Array} converted Coordinates as array with float values
     */
    convertCoordinatesToFloat: function (coord) {
        let convertedCoordinates = [];

        if (coord !== undefined) {
            convertedCoordinates = coord.map(coordinate => {
                const regExp = new RegExp(/[()]/g),
                    coordString = coordinate.toString().replace(regExp, "");

                return parseFloat(coordString);
            });
        }

        return convertedCoordinates;
    },

    /**
     * Creates a polygon around the WKT feature
     * @return {void}
     */
    showFeature: function () {
        var feature = this.getFeature();

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
        var styleListModel = Radio.request("StyleList", "returnModelById", mapMarkerStyleId);

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
        var value = this.getWKTGeom(type, geom);

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
    }
});

export default MapMarkerModel;
