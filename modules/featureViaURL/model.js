const featureViaURL = Backbone.Model.extend({
    defaults: {
        layerName: "Features via URL",
        // Labeling for the properties of the Features
        featureLabel: "Beschriftung",
        xCoordLabel: "X-Koordinate",
        yCoordLabel: "Y-Koordinate"
    },
    /**
     * @class FeatureViaURL
     * @description Creates a new GeoJSON layer on the basis of the given features by the user via the URL.
     * @extends Backbone.Model
     * @param {Object} config The configuration of the module from the config.js.
     * @constructs
     * @property {String} layerName="Features via URL" The name of the GeoJSON layer.
     * @property {String} featureLabel="Beschriftung" The label for the features.
     * @property {String} xCoordLabel="X-Koordinate" The label for the x-coordinate of the features.
     * @property {String} yCoordLabel="Y-Koordinate" The label for the y-coordinate of the features.
     * @fires Core#RadioRequestParametricURLGetFeatureViaURL
     * @fires Core.ConfigLoader#RadioRequestParserGetTreeType
     * @fires Tools.AddGeoJSON#RadioTriggerAddGeoJSONAddGeoJsonToMap
     */
    initialize: function (config) {
        this.setValues(config.layerName, config.label?.feature, config.label?.xCoord, config.label?.yCoord);

        const geoJSON = this.createGeoJSON(config.epsg, Radio.request("ParametricURL", "getFeatureViaURL")),
            treeType = Radio.request("Parser", "getTreeType"),
            parentId = treeType === "light" ? "tree" : "Overlayer";

        Radio.trigger("AddGeoJSON", "addGeoJsonToMap", this.get("layerName"), config.layerId, geoJSON, parentId, config.styleId);
    },
    /**
     * Creates a basic GeoJSON structure and add the features from the user to it.
     *
     * @param {Integer} [epsg=4326] The EPSG-Code in which the features are coded.
     * @param {Object[]} features The features given by the user to be added to the map.
     * @returns {JSON} GeoJSON containing the features.
     */
    createGeoJSON: function (epsg = 4326, features) {
        const geoJSON = {
                "type": "FeatureCollection",
                "crs": {
                    "type": "link",
                    "properties": {
                        "href": "http://spatialreference.org/ref/epsg/" + epsg + "/proj4/",
                        "type": "proj4"
                    }
                },
                "features": []
            },
            featureLabel = this.get("featureLabel"),
            xCoordLabel = this.get("xCoordLabel"),
            yCoordLabel = this.get("yCoordLabel");
        let featureJSON;

        features.forEach(feature => {
            featureJSON = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [feature.x, feature.y]
                },
                "properties": {
                }
            };
            featureJSON.properties[featureLabel] = feature.label;
            featureJSON.properties[xCoordLabel] = feature.x;
            featureJSON.properties[yCoordLabel] = feature.y;
            geoJSON.features.push(featureJSON);
        });

        return geoJSON;
    },
    /**
     * Sets values on the model if given in the config.
     *
     * @param {String} [layerName] Name of the layer for the given features from the URL.
     * @param {String} [featureLabel] Label for the feature descriptions.
     * @param {String} [xCoordLabel] Label for the x-coordinate of the features.
     * @param {String} [yCoordLabel] Label for the y-coordinate of the features.
     * @returns {void}
     */
    setValues: function (layerName, featureLabel, xCoordLabel, yCoordLabel) {
        if (layerName !== undefined) {
            this.set("layerName", layerName);
        }
        if (featureLabel !== undefined) {
            this.set("featureLabel", featureLabel);
        }
        if (xCoordLabel !== undefined) {
            this.set("xCoordLabel", xCoordLabel);
        }
        if (yCoordLabel !== undefined) {
            this.set("yCoordLabel", yCoordLabel);
        }
    }
});

export default featureViaURL;
