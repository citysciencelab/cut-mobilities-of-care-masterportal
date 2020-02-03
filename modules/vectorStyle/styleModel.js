import {Style} from "ol/style.js";
import PointStyle from "./pointStyle";
import TextStyle from "./textStyle";
import PolygonStyle from "./polygonStyle";

const VectorStyleModel = Backbone.Model.extend(/** @lends VectorStyleModel.prototype */{
    /**
     * @description Class to read style.json
     * @class VectorStyleModel
     * @extends Backbone.Model
     * @memberof VectorStyle
     * @constructs
     */
    defaults: {
        "conditions": null,
        "style": null
    },

    /**
     * Function is called from layer models for each feature.
     * @param   {ol/feature}  feature     the feature to style
     * @param   {Boolean} isClustered is feature clustered
     * @returns {ol/style/Style} style used in layer model
     */
    createStyle: function (feature, isClustered) {
        const rule = this.getRuleForFeature(feature),
            style = rule && rule.style ? rule.style : null,
            // geometry style is always requested
            styleObject = this.getGeometryStyle(feature, style, isClustered);

        // label style is optional and depends on some fields
        if (isClustered || rule.style.hasOwnProperty("labelField")) {
            if (_.isArray(styleObject)) {
                styleObject[0].setText(this.getLabelStyle(feature, rule.style, isClustered));
            }
            else {
                styleObject.setText(this.getLabelStyle(feature, rule.style, isClustered));
            }
        }

        return styleObject;
    },

    /**
     * Returns the style for the geometry object
     * @param   {ol/feature}  feature     the ol/feature to style
     * @param   {object|null}  style       styling rule from style.json
     * @param   {Boolean} isClustered Flag to show if feature is clustered.
     * @returns {ol/style/Style}    style is always returned
     */
    getGeometryStyle: function (feature, style, isClustered) {
        const geometryType = feature.getGeometry().getType();
        let styleObject;

        if (!style) {
            console.warn("No styling rules defined.");
            return new Style();
        }
        else if (geometryType === "Point") {
            styleObject = new PointStyle(feature, style, isClustered);
            return styleObject.getStyle();
        }
        else if (geometryType === "LineString") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }
        else if (geometryType === "LinearRing") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }
        else if (geometryType === "Polygon") {
            styleObject = new PolygonStyle(feature, style, isClustered);
            return styleObject.getStyle();
        }
        else if (geometryType === "MultiPoint") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }
        else if (geometryType === "MultiLineString") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }
        else if (geometryType === "MultiPolygon") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }
        else if (geometryType === "GeometryCollection") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }
        else if (geometryType === "Circle") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }

        console.warn("Unknown geometry type: " + geometryType);
        return new Style();
    },

    /**
     * Returns the style to label the object
     * @param   {ol/feature}  feature     the ol/feature to style
     * @param   {object}  style       styling rule from style.json
     * @param   {Boolean} isClustered Flag to show if feature is clustered.
     * @returns {ol/style/Text}    style is always returned
     */
    getLabelStyle: function (feature, style, isClustered) {
        const styleObject = new TextStyle(feature, style, isClustered);

        return styleObject.getStyle();
    },

    /**
     * Checking all rules returning the first one that fits to the feature.
     * Implements OR logic to return exactly one rule
     * @param {ol/feature} feature the feature to check
     * @returns {object|null} returns one rule object or null if no rule fits to the feature
     */
    getRuleForFeature: function (feature) {
        return this.get("rules").find(rule => {
            if (this.checkConditions(feature, rule)) {
                return rule;
            }

            return null;
        }, this);
    },

    /**
     * Checks one feature against one rule returning true if rule fits or if rule has no condiotions.
     * Available condition checks: "properties", "sequence"
     * @param   {ol/feature} feature the feature to check
     * @param   {object} rule the rule to check
     * @returns {Boolean} returns true if all properties are found
     */
    checkConditions: function (feature, rule) {
        let properties = true,
            sequence = true;

        if (rule.hasOwnProperty("conditions")) {
            if (rule.conditions.hasOwnProperty("properties")) {
                properties = this.checkProperties(feature, rule.conditions.properties);
            }
            if (rule.conditions.hasOwnProperty("sequence")) {
                sequence = this.checkGeometrySequence(feature, rule.conditions.sequence);
            }

            return properties && sequence;
        }
        return true;
    },

    /**
     * Loops one feature through all properties returning true if all properties are satisfied. Otherwhile false.
     * @param   {ol/feature} feature to check
     * @param   {object} properties key/value pairs to check
     * @param   {string} properties.key attribute name or object path to check
     * @param   {string} properties.value attribute value
     * @returns {Boolean} true if all properties are satisfied
     */
    checkProperties: function (feature, properties) {
        const featureProperties = feature.getProperties();
        let key;

        for (key in properties) {
            const value = properties[key];

            if (!this.checkProperty(featureProperties, key, value)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Checks one feature against one property returning true if property satisfies condition.
     * @param   {object} featureProperties properties of the feature that has to be checked
     * @param   {string} key attribute name or object path to check
     * @param   {string|number|array} value attribute value or object path to check
     * @returns {Boolean} true if property is satisfied. Otherwhile returns false.
     */
    checkProperty: function (featureProperties, key, value) {
        const featureValue = this.getFeatureValue(featureProperties, key),
            referenceValue = this.getReferenceValue(featureProperties, value);

        if ((typeof featureValue === "string" || typeof featureValue === "number") && (typeof referenceValue === "string" || typeof referenceValue === "number" ||
        (Array.isArray(referenceValue) && referenceValue.every(element => typeof element === "number") &&
        (referenceValue.length === 2 || referenceValue.length === 4)))) {
            return this.compareValues(featureValue, referenceValue);
        }

        return false;
    },

    /**
     * Returns the reference value. If necessary it loops through the feature properties object structure.
     * @param   {object} featureProperties properties of the feature
     * @param   {string} value attribute value or object path to check
     * @returns {undefined} attribute property can be of any type
     */
    getReferenceValue: function (featureProperties, value) {
        const valueIsObjectPath = this.isObjectPath(value);
        let referenceValue = value;

        // sets the real feature property value in case referenceValue is an object path
        if (valueIsObjectPath) {
            referenceValue = this.getFeaturePropertyByPath(featureProperties, referenceValue);
        }

        // sets the real feature property values also for min-max-arrays in case its values are object pathes.
        if (Array.isArray(referenceValue)) {
            referenceValue.forEach((element, index, arr) => {
                if (this.isObjectPath(element)) {
                    arr[index] = this.getFeaturePropertyByPath(featureProperties, element);
                }
            }, this);
        }

        return referenceValue;
    },

    /**
     * Returns feature value identified by key. If necessary it loops through the feature properties object structure.
     * @param   {object} featureProperties properties of the feature
     * @param   {string} key attribute name or object path to check
     * @returns {undefined} attribute property can be of any type
     */
    getFeatureValue: function (featureProperties, key) {
        const keyIsObjectPath = this.isObjectPath(key);

        if (keyIsObjectPath) {
            return this.getFeaturePropertyByPath(featureProperties, key);
        }
        else if (featureProperties.hasOwnProperty(key)) {
            return featureProperties[key];
        }

        return null;
    },

    /**
     * Returns the object path of featureProperties which is defined as path.
     * Returns null if "path" is not included in featureProperties.
     * @param   {object} featureProperties properties of the feature
     * @param   {string} path object path starting with "path://"
     * @returns {object|null} sub object of featureProperties
     */
    getFeaturePropertyByPath: function (featureProperties, path) {
        let featureProperty = featureProperties;
        const pathArray = path.substring(1).split(".").filter(element => element !== "");

        for (let i = 0; i < pathArray.length; i++) {
            const element = pathArray[i];

            if (!featureProperty.hasOwnProperty(element)) {
                return null;
            }
            featureProperty = featureProperty[element];
        }

        return featureProperty;
    },

    /**
     * Compares values according to its type.
     * @param   {string|number} featureValue value to compare
     * @param   {string|number|array} referenceValue value to compare
     * @returns {Boolean} true if values equal or in range
     */
    compareValues: function (featureValue, referenceValue) {
        let value = featureValue;

        // plain value compare for strings
        if (typeof featureValue === "string" && typeof referenceValue === "string") {
            if (featureValue === referenceValue) {
                return true;
            }
        }
        // plain value compare trying to parse featureValue to float
        else if (typeof referenceValue === "number") {
            value = parseFloat(value);

            if (!isNaN(featureValue) && value === parseFloat(referenceValue)) {
                return true;
            }
        }
        // compare value in range
        else if (Array.isArray(referenceValue) && referenceValue.every(element => typeof element === "number") && (referenceValue.length === 2 || referenceValue.length === 4)) {
            value = parseFloat(value);

            if (!isNaN(featureValue)) {
                // value in absolute range of numbers [minValue, maxValue]
                if (referenceValue.length === 2) {
                    // do nothing
                }
                // value in relative range of numbers [minValue, maxValue, relMin, relMax]
                else if (referenceValue.length === 4) {
                    value = 1 / (parseFloat(referenceValue[3], 10) - parseFloat(referenceValue[2], 10)) * (value - parseFloat(referenceValue[2], 10));
                }
                if (referenceValue[0] === null && referenceValue[1] === null) {
                    // everything is in a range of [null, null]
                    return true;
                }
                else if (referenceValue[0] === null) {
                    // if a range [null, x] is given, x should not be included
                    return value < parseFloat(referenceValue[1]);
                }
                else if (referenceValue[1] === null) {
                    // if a range [x, null] is given, x should be included
                    return value >= parseFloat(referenceValue[0]);
                }

                // if a range [x, y] is given, x should be included but y should not be included
                return value >= parseFloat(referenceValue[0]) && value < parseFloat(referenceValue[1]);
            }
        }


        return false;
    },

    /**
     * [checkGeometrySequence description]
     * @todo noch keine Ahnung, wie man das implementieren kann. Wie sieht die Geometry aus? Können MultiLines einzeln gestylt werden?
     * @returns {void}
     */
    checkGeometrySequence: function () {
        return true;
    },

    /**
     * checks if value starts with special prefix to determine if value is a object path
     * @param   {string} value string to check
     * @returns {Boolean} true is value is an object path
     */
    isObjectPath: function (value) {
        return typeof value === "string" && value.startsWith("@");
    }
});

export default VectorStyleModel;
