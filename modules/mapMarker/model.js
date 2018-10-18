import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Overlay from "ol/Overlay.js";
import {Stroke, Style, Fill} from "ol/style.js";
import {WKT} from "ol/format.js";

const MapMarkerModel = Backbone.Model.extend({
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
                    color: "rgba(8, 119, 95, 0.3)"
                })
            })
        }),
        wkt: "",
        markers: [],
        zoomLevel: 7
    },
    initialize: function () {
        var searchConf = Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"})[0].attr;

        Radio.trigger("Map", "addOverlay", this.get("marker"));
        Radio.trigger("Map", "addLayerToIndex", [this.get("polygon"), Radio.request("Map", "getLayers").getArray().length]);

        if (_.has(searchConf, "zoomLevel")) {
            this.setZoomLevel(searchConf.zoomLevel);
        }
    },

    getFeature: function () {
        var format = new WKT(),
            feature = format.readFeature(this.get("wkt"));

        return feature;
    },

    getExtent: function () {
        var feature = this.getFeature(),
            extent = feature.getGeometry().getExtent();

        return extent;
    },

    /**
     * Hilsfunktion zum ermitteln eines Features mit textueller Beschreibung
     * @param  {string} type Geometrietyp
     * @param  {number[]} geom Array mit Koordinatenwerten
     * @return {string} wkt WellKnownText-Geom
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
     * Erstellt ein Polygon um das WKT-Feature
     * @return {void}
     */
    showFeature: function () {
        var feature = this.getFeature();

        this.get("polygon").getSource().addFeature(feature);
        this.get("polygon").setVisible(true);
    },

    /**
     * Löscht das Polygon
     * @return {void}
     */
    hideFeature: function () {
        this.get("polygon").getSource().clear();
        this.get("polygon").setVisible(false);
    },

    // setter for zoomLevel
    setZoomLevel: function (value) {
        this.set("zoomLevel", value);
    },

    // setter for wkt
    setWkt: function (type, geom) {
        var value = this.getWKTGeom(type, geom);

        this.set("wkt", value);
    },

    // setter for marker
    setMarker: function (value) {
        this.set("marker", value);
    },

    // setter for markers
    setMarkers: function (value) {
        this.set("markers", value);
    },

    // setter for polygon
    setPolygon: function (value) {
        this.set("polygon", value);
    }
});

export default MapMarkerModel;
