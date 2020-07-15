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
            URL Param for Points:       ?featureViaURL=[{"type":"Point","coordinates":[10,53.5],"label":"TestPunkt"}]
            URL Param for LineStrings:  ?featureViaURL=[{"type":"LineString","coordinates":[[10.05,53.5],[10,53.5], [10,53.55]],"label":"TestLinie"}]
        */

        this.setValues(config.label?.feature, config.label?.coord, config.label?.type);

        const geoJSON = this.createGeoJSON(config.epsg, Radio.request("ParametricURL", "getFeatureViaURL")),
            treeType = Radio.request("Parser", "getTreeType"),
            parentId = treeType === "light" ? "tree" : "Overlayer";

        // TODO: Irgendwie einen Ordner anlegen für die Feature, wenn der treeType nicht light ist
        Radio.trigger("AddGeoJSON", "addGeoJsonToMap", config.layers[0].name, config.layers[0].id, geoJSON, parentId, config.layers[0].styleId);
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
            coordLabel = this.get("coordLabel"),
            typeLabel = this.get("typeLabel");
        let featureJSON;

        features.forEach(feature => {
            featureJSON = {
                "type": "Feature",
                "geometry": {
                    "type": feature.type,
                    "coordinates": feature.coordinates
                },
                "properties": {
                }
            };
            featureJSON.properties[featureLabel] = feature.label;
            featureJSON.properties[coordLabel] = feature.coordinates;
            featureJSON.properties[typeLabel] = feature.type;
            geoJSON.features.push(featureJSON);
        });

        return geoJSON;
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
