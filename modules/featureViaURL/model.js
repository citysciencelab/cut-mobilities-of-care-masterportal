const featureViaURL = Backbone.Model.extend({
    defaults: {
        featureLabel: "Beschriftung",
        coordLabel: "Koordinaten",
        typeLabel: "Geometrietyp"
    },
    /**
     * @class FeatureViaURL
     * @description Creates a new GeoJSON layer on the basis of the given features by the user via the URL.
     * @extends Backbone.Model
     * @param {Object} config The configuration of the module from the config.js.
     * @constructs
     * @property {String} featureLabel="Beschriftung" The label for the features.
     * @property {String} coordLabel="Koordinaten" The label for the coordinates of the features.
     * @property {String} typeLabel="Geometrietyp" The label for the type of the features.
     * @fires Core#RadioRequestParametricURLGetFeatureViaURL
     * @fires Core.ConfigLoader#RadioRequestParserGetTreeType
     * @fires Tools.AddGeoJSON#RadioTriggerAddGeoJSONAddGeoJsonToMap
     */
    initialize: function (config) {
        // TODO: ERROR HANDLING IF PARAMS ARE MISSING
        // TODO: CONFIG DOC
        // TODO: TESTS?
        // TODO: Ticket aktualisieren, sobald PR gestellt!

        /*
            URL Param for Points:           ?featureViaURL=[{"layerId":"420","features":[{"coordinates":[10,53.5],"label":"TestPunkt"}]}]
            URL Param for LineStrings:      ?featureViaURL=[{"layerId":"4200","features":[{"coordinates":[[10.15,53.5],[10.05,53.5],[10.05,53.55]],"label":"TestLinie"}]}]
            URL Param for Polygons:         ?featureViaURL=[{"layerId":"4020","features":[{"coordinates":[[[10.05,53.5],[10,53.5],[9.80,53.55],[10,53.55]]],"label":"TestPolygon"}]}]
            URL Param for Multi-Polygons:   ?featureViaURL=[{"layerId":"4020","features":[{"coordinates":[[[10.05,53.5],[10,53.5],[9.80,53.55],[10,53.55]],[[10.072,53.492],[9.92,53.492],[9.736,53.558],[10.008,53.558]]],"label":"TestMultiPolygon"}]}]
        */

        this.setValues(config.label?.feature, config.label?.coord, config.label?.type);

        const gfiAttributes = this.createGFIAttributes(),
            layers = Radio.request("ParametricURL", "getFeatureViaURL"),
            parentId = treeType === "light" ? "tree" : "Overlayer",
            treeType = Radio.request("Parser", "getTreeType");
        let features,
            geoJSON,
            layerId,
            layerPosition;

        // TODO: Irgendwie einen Ordner anlegen für die Feature, wenn der treeType nicht light ist
        layers.forEach(layer => {
            layerId = layer.layerId;
            features = layer.features;
            layerPosition = this.findPosition(config.layers, layerId);
            if (layerPosition !== undefined) {
                geoJSON = this.createGeoJSON(config.epsg, features, config.layers[layerPosition].geometryType);
                Radio.trigger("AddGeoJSON", "addGeoJsonToMap", config.layers[layerPosition].name, config.layers[layerPosition].id, geoJSON, config.layers[layerPosition].styleId, parentId, gfiAttributes);
            }
            else {
                // TODO: Make this as an alert!
                console.error("FeatureViaURL: The layerID given by the URL was not defined in the config.js!");
            }
        });
    },
    /**
     * Creates a basic GeoJSON structure and add the features from the user to it.
     *
     * @param {Integer} [epsg=4326] The EPSG-Code in which the features are coded.
     * @param {Object[]} features The features given by the user to be added to the map.
     * @param {String} geometryType Geometry type of the given features.
     * @returns {JSON} GeoJSON containing the features.
     */
    createGeoJSON: function (epsg = 4326, features, geometryType) {
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
        };
        let featureJSON;

        features.forEach(feature => {
            featureJSON = {
                "type": "Feature",
                "geometry": {
                    "type": geometryType,
                    "coordinates": feature.coordinates
                },
                "properties": {
                    "featureLabel": feature.label,
                    "coordLabel": feature.coordinates,
                    "typeLabel": geometryType
                }
            };
            geoJSON.features.push(featureJSON);
        });

        return geoJSON;
    },
    /**
     * Creates an object for the gfiAttributes which can be configured through the config.js.
     *
     * @returns {Object} Object containing the gfiAttributes.
     */
    createGFIAttributes: function () {
        return {
            featureLabel: this.get("featureLabel"),
            coordLabel: this.get("coordLabel"),
            typeLabel: this.get("typeLabel")
        };
    },
    /**
     * Finds the position of the layer configuration in the array from the config.js if defined.
     *
     * @param {Object[]} layers Array of layer configurations from the config.js
     * @param {String} layerId Unique ID of the layer.
     * @returns {(Integer | undefined)} If found, return the position of the layer in the array; else return undefined.
     */
    findPosition: function (layers, layerId) {
        let position;

        layers.forEach((layer, index) => {
            if (layer.id === layerId) {
                position = index;
            }
        });
        return position;
    },
    /**
     * Sets values on the model if given in the config.
     *
     * @param {String} [featureLabel] Label for the feature descriptions.
     * @param {String} [coordLabel] Label for the x-coordinate of the features.
     * @param {String} [typeLabel] Label for the type of the features.
     * @returns {void}
     */
    setValues: function (featureLabel, coordLabel, typeLabel) {
        if (featureLabel !== undefined) {
            this.set("featureLabel", featureLabel);
        }
        if (coordLabel !== undefined) {
            this.set("xCoordLabel", coordLabel);
        }
        if (typeLabel !== undefined) {
            this.set("typeLabel", typeLabel);
        }
    }
});

export default featureViaURL;
