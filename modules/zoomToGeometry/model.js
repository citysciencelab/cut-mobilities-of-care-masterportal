import {WFS} from "ol/format.js";
import {DEVICE_PIXEL_RATIO} from "ol/has.js";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";

const ZoomToGeometry = Backbone.Model.extend({
    defaults: {
        layerId: "123456789",
        geometries: ["BEZIRK1", "BEZIRK2"],
        wfsParams: {
            url: "https://test-dienst",
            version: "1.1.0",
            typename: "app:bezirke",
            attribute: "bezirk_name"
        },
        isRender: false
    },
    initialize: function () {
        const name = Radio.request("ParametricURL", "getZoomToGeometry"),
            channel = Radio.channel("ZoomToGeometry");

        channel.on({
            "zoomToGeometry": this.zoomToGeometry,
            "setIsRender": this.setIsRender
        }, this);

        // if (name.length > 0 && name !== "ALL") {
        if (name.length > 0) {
            this.zoomToGeometry(name, this.get("wfsParams"), this.get("layerId"));
        }

        Radio.trigger("Map", "registerListener", "postcompose", this.handlePostCompose, this);
    },
    /**
    * Zooms to a geometry loaded from a WFS.
    * @param {string} name - Name of the feature to zoom to.
    * @param {string} wfsParams - The parameters of the WFS from which the features are to be loaded.
    * @param {string} layerId - Id from WFS-layer
    * @returns {void}
    **/
    zoomToGeometry: function (name, wfsParams, layerId) {
        const layerInformation = getLayerWhere({id: layerId});

        this.getGeometryFromWFS(name, wfsParams, layerInformation);
    },

    /**
     * Fetches the data from WFS.
     * @param {string} name - Name of the feature to zoom to.
     * @param {string} wfsParams - The parameters of the WFS from which the features are to be loaded.
     * @param {object} layerInformation - All information from a layer to be fetched.
     * @returns {void}
     */
    getGeometryFromWFS: async function (name, wfsParams, layerInformation) {
        const url = new URL(layerInformation.url),
            params = {
                "SERVICE": "WFS",
                "VERSION": layerInformation.version,
                "REQUEST": "GetFeature",
                "TYPENAME": layerInformation.featureType
            };

        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        fetch(url)
            .then(response => response.text())
            .then(responseAsString => new window.DOMParser().parseFromString(responseAsString, "text/xml"))
            .then(responseXML => {
                this.zoomToFeature(responseXML, name, wfsParams.attribute);
            });
    },

    /**
    * zommt auf das Feature, das vom WFS geladen wurde.
    * @param {obj} data - der GML String
    * @param {string} name - Name des Features
    * @param {string} attribute - GML-Attribut das nach dem Namen durchsucht werden soll
    * @returns {void}
    **/
    zoomToFeature: function (data, name, attribute) {
        var foundFeature = this.parseFeatures(data, name, attribute),
            extent;

        if (_.isUndefined(foundFeature)) {
            Radio.trigger("Alert", "alert", {
                text: "<strong>Leider konnten die Objekte zu denen gezommt werden soll nicht geladen werden</strong> <br> <small>Details: Kein Objekt gefunden, dessen Attribut \"" + attribute + "\" den Wert \"" + name + "\" einnimmt.</small>",
                kategorie: "alert-warning"
            });
        }
        else {
            extent = this.calcExtent(foundFeature);
            Radio.trigger("Map", "zoomToExtent", extent);
        }
        this.setFeatureGeometry(foundFeature.getGeometry());
    },

    /**
    * durchsucht ein GML String nach einem bestimmten Feature
    * @param {obj} data - der GML String
    * @param {string} name - Name des Features
    * @param {string} attribute - GML-Attribut das nach dem Namen durchsucht werden soll
    * @returns {void}
    **/
    parseFeatures: function (data, name, attribute) {
        var format = new WFS(),
            features = format.readFeatures(data),
            foundFeature = features.filter(function (feature) {
                if (!_.contains(feature.getKeys(), attribute)) {
                    return false;
                }
                return feature.get(attribute).toUpperCase().trim() === name.toUpperCase().trim();
            });

        return foundFeature[0];
    },
    calcExtent: function (feature) {
        var coordLength = 0,
            polygonIndex = 0;

        // feature.getGeometry() = Multipolygon
        // für den Extent wird das größte Polygon genommen
        _.each(feature.getGeometry().getPolygons(), function (polygon, index) {
            if (polygon.getCoordinates()[0].length > coordLength) {
                coordLength = polygon.getCoordinates()[0].length;
                polygonIndex = index;
            }
        });

        return feature.getGeometry().getPolygon(polygonIndex).getExtent();
    },

    handlePostCompose: function (evt) {
        var canvas = evt.context,
            map = evt.target;

        if (this.get("isRender") === true && _.isUndefined(this.get("featureGeometry")) === false) {
            canvas.beginPath();
            this.drawOutsidePolygon(canvas, map.getSize());
            this.drawInsidePolygon(canvas, map);
            canvas.fillStyle = "rgba(0, 0, 0, 0.4)";
            canvas.fill();
            canvas.restore();
        }
    },

    drawOutsidePolygon: function (canvas, size) {
        var height = size[1] * DEVICE_PIXEL_RATIO,
            width = size[0] * DEVICE_PIXEL_RATIO;

        canvas.moveTo(0, 0);
        canvas.lineTo(width, 0);
        canvas.lineTo(width, height);
        canvas.lineTo(0, height);
        canvas.lineTo(0, 0);
        canvas.closePath();
    },

    drawInsidePolygon: function (canvas, map) {

        _.each(this.get("featureGeometry").getPolygons(), function (polygon) {
            // Damit es als inneres Polygon erkannt wird, muss es gegen die Uhrzeigerrichtung gezeichnet werden
            var coordinates = polygon.getCoordinates()[0].reverse();

            _.each(coordinates, function (coordinate) {
                var coord = map.getPixelFromCoordinate(coordinate);

                canvas.lineTo(coord[0] * DEVICE_PIXEL_RATIO, coord[1] * DEVICE_PIXEL_RATIO);
            });
            canvas.closePath();
        });
    },

    // setter for wfsParams
    setWfsParams: function (value) {
        this.set("wfsParams", value);
    },
    // setter for bezirk Geometry
    setFeatureGeometry: function (value) {
        this.set("featureGeometry", value);
    },
    setIsRender: function (value) {
        this.set("isRender", value);
    }
});

export default ZoomToGeometry;
