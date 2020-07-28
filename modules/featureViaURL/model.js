const FeatureViaURL = Backbone.Model.extend(/** @lends FeatureViaURL.prototype*/{
    defaults: {
        // NOTE: Initial values are set here because the translation is too late. Can be removed when the translations are possible for the labels.
        coordLabel: "Koordinaten",
        featureLabel: "Beschriftung",
        folderName: "",
        typeLabel: "Geometrietyp"
    },
    /**
     * @class FeatureViaURL
     * @description Creates a new GeoJSON layer on the basis of the given features by the user via the URL.
     * @extends Backbone.Model
     * @memberof FeatureViaURL
     * @param {Object} config The configuration of the module from the config.js.
     * @constructs
     * @property {String} featureLabel="Beschriftung" The label for the features.
     * @property {String} coordLabel="Koordinaten" The label for the coordinates of the features.
     * @property {String} typeLabel="Geometrietyp" The label for the type of the features.
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioRequestParametricURLGetFeatureViaURL
     * @fires Core.ConfigLoader#RadioRequestParserGetTreeType
     * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
     * @fires Tools.AddGeoJSON#RadioTriggerAddGeoJSONAddGeoJsonToMap
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function (config) {
        if (!config || !Array.isArray(config.layers) || config.layers.length === 0) {
            Radio.trigger("Alert", "alert", "FeatureViaURL: No layers were defined in the config.js for the given features.");
            return;
        }
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.translate
        });

        this.createLayers(config.layers, config.epsg);
    },
    /**
     * Creates a basic GeoJSON structure and adds the features given by the user from the URL to it.
     *
     * @param {Number} [epsg=4326] The EPSG-Code in which the features are coded.
     * @param {Object[]} features The features given by the user to be added to the map.
     * @param {String} geometryType Geometry type of the given features.
     * @returns {Object} GeoJSON containing the features.
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
        let featureJSON,
            coordinates;

        features.forEach(feature => {
            coordinates = feature.coordinates;
            if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0 || !features.label) {
                Radio.trigger("Alert", "alert", "FeatureViaURL: Not all features could be parsed.");
                return;
            }

            featureJSON = {
                "type": "Feature",
                "geometry": {
                    "type": geometryType,
                    "coordinates": coordinates
                },
                "properties": {
                    "featureLabel": feature.label,
                    "coordLabel": coordinates,
                    "typeLabel": geometryType
                }
            };
            geoJSON.features.push(featureJSON);
        });

        return geoJSON;
    },
    /**
     * Creates the GeoJSON layers depending on the configuration and the URL-Parameters.
     * TODO: Testing of this function!
     *
     * @param {Object[]} configLayers The layer configurations for the feature layers.
     * @param {Number} epsg The EPSG-Code in which the features are coded.
     * @returns {void}
     */
    createLayers: function (configLayers, epsg) {
        const gfiAttributes = {
                featureLabel: this.get("featureLabel"),
                coordLabel: this.get("coordLabel"),
                typeLabel: this.get("typeLabel")
            },
            layers = Radio.request("ParametricURL", "getFeatureViaURL"),
            treeType = Radio.request("Parser", "getTreeType");
        let features,
            geoJSON,
            geometryType,
            layerId,
            layerPosition,
            parentId = "tree";

        if (treeType === "custom") {
            Radio.trigger("Parser", "addFolder", this.get("folderName"), "featureViaURLFolder", "Overlayer", 0, true, "modules.featureViaURL.folderName");
            parentId = "featureViaURLFolder";
        }

        layers.forEach(layer => {
            layerId = layer.layerId;
            features = layer.features;
            layerPosition = configLayers.findIndex(element => element.id === layerId);
            if (layerPosition === -1) {
                Radio.trigger("Alert", "alert", `FeatureViaURL: The layer with the id ${layerId} was not found.`);
                return;
            }
            if (!configLayers[layerPosition].name) {
                Radio.trigger("Alert", "alert", `FeatureViaURL: No name was defined for the layer with the id ${layerId}.`);
                return;
            }
            geometryType = configLayers[layerPosition].geometryType;
            if (geometryType !== "LineString" && geometryType !== "Point" && geometryType !== "Polygon") {
                Radio.trigger("Alert", "alert", `FeatureViaURL: The given geometryType ${geometryType} is not supported.`);
                return;
            }
            if (!features || !Array.isArray(features) || features.length === 0) {
                Radio.trigger("Alert", "alert", "FeatureViaURL: No features in the right format were given.");
                return;
            }
            geoJSON = this.createGeoJSON(epsg, features, geometryType);
            Radio.trigger("AddGeoJSON", "addGeoJsonToMap", configLayers[layerPosition].name, configLayers[layerPosition].id, geoJSON, configLayers[layerPosition].styleId, parentId, gfiAttributes);
        });
    },
    /**
     * Translates the values of this module, namely "coordLabel", "featureLabel", "folderName" and "typeLabel".
     * NOTE: The three layer labels are currently not updated when changing a language. To accomplish this the layer will have to be removed and readded.
     *
     * @returns {void}
     */
    translate: function () {
        this.set("coordLabel", i18next.t("common:modules.featureViaURL.coordLabel"));
        this.set("featureLabel", i18next.t("common:modules.featureViaURL.featureLabel"));
        this.set("folderName", i18next.t("common:modules.featureViaURL.coordLabel"));
        this.set("typeLabel", i18next.t("common:modules.featureViaURL.typeLabel"));
    }
});

export default FeatureViaURL;
