import {Style} from "ol/style.js";
import PointStyle from "./pointStyle";
import TextStyle from "./textStyle";
import PolygonStyle from "./polygonStyle";
import LinestringStyle from "./linestringStyle";
import CesiumStyle from "./cesiumStyle";
import {fetch as fetchPolyfill} from "whatwg-fetch";
import axios from "axios";

const VectorStyleModel = Backbone.Model.extend(/** @lends VectorStyleModel.prototype */{
    defaults: {
        "styleId": null,
        "rules": null,
        "legendInfos": []
    },

    /**
     * @description Class to read style.json
     * @class VectorStyleModel
     * @extends Backbone.Model
     * @memberof VectorStyle
     * @constructs
     * @param {String} styleId styleId is set in style.json
     * @param {Object[]} rules Array with styling rules and its conditions.
     * @param {Object[]} legendInfos list of used styling rules for legend grafic
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        // legendInfos must be set on initialize. Otherwhile legendInfos are mixed up with other VectorStyleModels
        this.set("legendInfos", []);
    },

    /**
     * Function is called from layer models for each feature.
     * @param   {ol/feature}  feature     the feature to style
     * @param   {Boolean} isClustered is feature clustered
     * @returns {ol/style/Style} style used in layer model
     */
    createStyle: function (feature, isClustered) {
        const rules = this.getRulesForFeature(feature),
            // Takes first rule in array for labeling so that is giving precedence to the order in the style.json
            style = Array.isArray(rules) && rules.length > 0 ? rules[0].style : null,
            hasLabelField = style && style.hasOwnProperty("labelField"),
            styleObject = this.getGeometryStyle(feature, rules, isClustered);

        // label style is optional and depends on some fields
        if (isClustered || hasLabelField) {
            if (Array.isArray(styleObject)) {
                styleObject[0].setText(this.getLabelStyle(feature, style, isClustered));
            }
            else {
                styleObject.setText(this.getLabelStyle(feature, style, isClustered));
            }
        }

        return styleObject;
    },

    /**
     * Requests the DescribeFeatureType of the wfs layer and starts the function to parse the xml and creates the legend info
     * @param   {string} wfsURL url from layer
     * @param   {string} version wfs version from layer
     * @param   {string} featureType wfs feature type from layer
     * @param   {string[] | string} styleGeometryType The configured geometry type of the layer
     * @returns {void}
     */
    getGeometryTypeFromWFS: function (wfsURL, version, featureType, styleGeometryType) {
        const params = {
            "SERVICE": "WFS",
            "VERSION": version,
            "REQUEST": "DescribeFeatureType"
        };
        let url = wfsURL + "?";

        Object.keys(params).forEach(key => {
            url += key + "=" + params[key] + "&";
        });
        url = url.slice(0, -1);

        fetchPolyfill(url)
            .then(response => response.text())
            .then(responseAsString => new window.DOMParser().parseFromString(responseAsString, "text/xml"))
            .then(responseXML => {
                const subElements = this.getSubelementsFromXML(responseXML, featureType),
                    geometryTypes = this.getTypeAttributesFromSubelements(subElements, styleGeometryType);

                this.createLegendInfo(geometryTypes);
            })
            .catch(error => {
                console.warn("The fetch of the data failed with the following error message: " + error);
                Radio.trigger("Alert", "alert", {
                    text: "<strong>" + i18next.t("common:modules.vectorStyle.styleModel.getGeometryTypeFromWFSFetchfailed") + "</strong> <br>"
                        + "<small>" + i18next.t("common:modules.vectorStyle.styleModel.getGeometryTypeFromWFSFetchfailedMessage") + "</small>",
                    kategorie: "alert-warning"
                });
            });
    },

    /**
     * Requests the DescribeFeatureType of the secured wfs layer and starts the function to parse the xml and creates the legend info
     * @param   {string} wfsURL url from layer
     * @param   {string} version wfs version from layer
     * @param   {string} featureType wfs feature type from layer
     * @param   {string[] | string} styleGeometryType The configured geometry type of the layer
     * @returns {void}
     */
    getGeometryTypeFromSecuredWFS: function (wfsURL, version, featureType, styleGeometryType) {
        const params = {
            "SERVICE": "WFS",
            "VERSION": version,
            "REQUEST": "DescribeFeatureType"
        };
        let url = wfsURL + "?";

        Object.keys(params).forEach(key => {
            url += key + "=" + params[key] + "&";
        });
        url = url.slice(0, -1);

        axios({
            method: "GET",
            url: url,
            withCredentials: true,
            responseType: "text"
        })
            .then(responseAsString => new window.DOMParser().parseFromString(responseAsString, "text/xml"))
            .then(responseXML => {
                const subElements = this.getSubelementsFromXML(responseXML, featureType),
                    geometryTypes = this.getTypeAttributesFromSubelements(subElements, styleGeometryType);

                this.createLegendInfo(geometryTypes);
            })
            .catch(error => {
                console.warn("The fetch of the data failed with the following error message: " + error);
                Radio.trigger("Alert", "alert", {
                    text: "<strong>" + i18next.t("common:modules.vectorStyle.styleModel.getGeometryTypeFromWFSFetchfailed") + "</strong> <br>"
                        + "<small>" + i18next.t("common:modules.vectorStyle.styleModel.getGeometryTypeFromWFSFetchfailedMessage") + "</small>",
                    kategorie: "alert-warning"
                });
            });
    },

    /**
     * Parses the xml to get the subelements from the layer
     * @param   {string} xml response xml
     * @param   {string} featureType wfs feature type from layer
     * @returns {object[]} subElements of the xml element
     */
    getSubelementsFromXML: function (xml, featureType) {
        const elements = xml ? Array.from(xml.getElementsByTagName("element")) : [];
        let subElements = [];

        elements.forEach(element => {
            if (element.getAttribute("name") === featureType) {
                subElements = Array.from(element.getElementsByTagName("element"));
            }
        });
        return subElements;
    },

    /**
     * Parses the geometry types from the subelements
     * @param   {object[]} [subElements=[]] xml subelements
     * @param   {string[] | string} styleGeometryType The configured geometry type of the layer
     * @returns {string[]} geometry types of the layer
     */
    getTypeAttributesFromSubelements: function (subElements = [], styleGeometryType) {
        const geometryType = [];

        subElements.forEach(elements => {
            const typeAttribute = elements.getAttribute("type");
            let geomType = styleGeometryType;

            if (typeAttribute && typeAttribute.includes("gml")) {
                geomType = styleGeometryType || typeAttribute.split("gml:")[1].replace("PropertyType", "");
                if (geomType === "Geometry") {
                    geometryType.push("Point");
                    geometryType.push("Polygon");
                    geometryType.push("LineString");
                }
                else if (Array.isArray(geomType)) {
                    geomType.forEach(singleGeomType => geometryType.push(singleGeomType));
                }
                else {
                    geometryType.push(geomType);
                }
            }
        });
        return geometryType;
    },

    /**
     * Creates the style objects for the layer
     * @param   {string[]} geometryType Array of geometry types
     * @returns {void}
     */
    createLegendInfo: function (geometryType) {
        const rules = this.get("rules");
        let styleObject,
            simpleGeom;

        geometryType.forEach(geom => rules.forEach(rule => {
            if (geom.includes("Multi")) {
                simpleGeom = geom.replace("Multi", "");
                styleObject = this.getMultiGeometryStyle(simpleGeom, "", rule, false);
            }
            else {
                simpleGeom = geom;
                styleObject = this.getSimpleGeometryStyle(simpleGeom, "", rule, false);
            }
            this.addLegendInfo(simpleGeom, styleObject, rule);
        }));
    },

    /**
     * Returns true if feature contains some kind of MultiGeometry
     * @param   {string}  geometryType     the geometry type to check
     * @returns {Boolean} is geometrytype a multiGeometry
     */
    isMultiGeometry: function (geometryType) {
        return geometryType === "MultiPoint" || geometryType === "MultiLineString" || geometryType === "MultiPolygon" || geometryType === "GeometryCollection" || geometryType === "Cesium";
    },

    /**
     * Returns the style for the geometry object
     * @param   {ol/feature}  feature     the ol/feature to style
     * @param   {object[]}  rules       styling rules to check. Array can be empty.
     * @param   {Boolean} isClustered Flag to show if feature is clustered.
     * @returns {ol/style/Style}    style is always returned
     */
    getGeometryStyle: function (feature, rules, isClustered) {
        const geometryType = feature ? feature.getGeometry().getType() : "Cesium",
            isMultiGeometry = this.isMultiGeometry(geometryType);

        // For simple geometries the first styling rule is used.
        // That algorithm implements an OR statement between multiple valid conditions giving precedence to its order in the style.json.
        if (!isMultiGeometry && rules.hasOwnProperty(0) && rules[0].hasOwnProperty("style")) {
            return this.getSimpleGeometryStyle(geometryType, feature, rules[0], isClustered);
        }
        // MultiGeometries must be checked against all rules because there might be a "sequence" in the condition.
        else if (isMultiGeometry && rules.length > 0 && rules.every(element => element.hasOwnProperty("style"))) {
            return this.getMultiGeometryStyle(geometryType, feature, rules, isClustered);
        }

        console.warn("No valid styling rule found.");
        return new Style();
    },

    /**
     * Returns the style for simple (non-multi) geometry types
     * @param   {string}  geometryType GeometryType
     * @param   {ol/feature}  feature     the ol/feature to style
     * @param   {object[]}  rule       styling rules to check.
     * @param   {Boolean} isClustered  Flag to show if feature is clustered.
     * @returns {ol/style/Style}    style is always returned
     */
    getSimpleGeometryStyle: function (geometryType, feature, rule, isClustered) {
        const style = rule.style;
        let styleObject;

        if (geometryType === "Point") {
            styleObject = new PointStyle(feature, style, isClustered);
            this.addLegendInfo("Point", styleObject, rule);
            return styleObject.getStyle();
        }
        else if (geometryType === "LineString") {
            styleObject = new LinestringStyle(feature, style, isClustered);
            this.addLegendInfo("LineString", styleObject, rule);
            return styleObject.getStyle();
        }
        else if (geometryType === "LinearRing") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }
        else if (geometryType === "Polygon") {
            styleObject = new PolygonStyle(feature, style, isClustered);
            this.addLegendInfo("Polygon", styleObject, rule);
            return styleObject.getStyle();
        }
        else if (geometryType === "Cesium") {
            styleObject = new CesiumStyle(rule);
            this.addLegendInfo("Cesium", styleObject, rule);
            return styleObject.getStyle();
        }
        else if (geometryType === "Circle") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }

        console.warn("Geometry type not implemented: " + geometryType);
        return new Style();
    },

    /**
     * Returns an array of simple geometry styles.
     * @param   {string}  geometryType GeometryType
     * @param   {ol/feature}  feature     the ol/feature to style
     * @param   {object[]}  rules       styling rules to check.
     * @param   {Boolean} isClustered  Flag to show if feature is clustered.
     * @returns {ol/style/Style[]}    style array of simple geometry styles is always returned
     */
    getMultiGeometryStyle: function (geometryType, feature, rules, isClustered) {
        const olStyle = [];
        let geometries = [];

        if (typeof feature === "object") {
            if (geometryType === "MultiPoint") {
                geometries = feature.getGeometry().getPoints();
            }
            else if (geometryType === "MultiLineString") {
                geometries = feature.getGeometry().getLineStrings();
            }
            else if (geometryType === "MultiPolygon") {
                geometries = feature.getGeometry().getPolygons();
            }
            else if (geometryType === "GeometryCollection") {
                geometries = feature.getGeometry().getGeometries();
            }

            geometries.forEach((geometry, index) => {
                const geometryTypeSimpleGeom = geometry.getType(),
                    rule = this.getRuleForIndex(rules, index);

                // For simplicity reasons we do not support multi encasulated multi geometries but ignore them.
                if (this.isMultiGeometry(geometryTypeSimpleGeom)) {
                    console.warn("Multi encapsulated multiGeometries are not supported.");
                }
                else if (rule) {
                    const simpleStyle = this.getSimpleGeometryStyle(geometryTypeSimpleGeom, feature, rule, isClustered);

                    simpleStyle.setGeometry(geometry);
                    olStyle.push(simpleStyle);
                }
            });
        }
        else if (geometryType === "Cesium") {
            rules.forEach(rule => {
                const simpleStyle = this.getSimpleGeometryStyle(geometryType, feature, rule, isClustered);

                olStyle.push(simpleStyle);
            });
        }
        else {
            const simpleStyle = this.getSimpleGeometryStyle(geometryType, feature, rules, isClustered);

            simpleStyle.setGeometry(geometryType);
            olStyle.push(simpleStyle);
        }

        return olStyle;
    },

    /**
     * Returns the best rule for the indexed feature giving precedence to the index position.
     * Otherwhile returns the rule with conditions but without a sequence definition.
     * Fallback is a rule without conditions.
     * That means also: A rule with fitting properties but without fitting sequence is never used for any multi geometry.
     * @param   {object[]} rules the rules to check
     * @param   {integer} index the index position of this geometry in the multi geometry
     * @returns {object|null} the rule or null if no rule match the conditions
     */
    getRuleForIndex: function (rules, index) {
        const indexedRule = this.getIndexedRule(rules, index),
            propertiesRule = rules.find(rule => {
                return rule.hasOwnProperty("conditions") && !rule.conditions.hasOwnProperty("sequence");
            }),
            fallbackRule = rules.find(rule => {
                return !rule.hasOwnProperty("conditions");
            });

        if (indexedRule) {
            return indexedRule;
        }
        else if (propertiesRule) {
            return propertiesRule;
        }
        else if (fallbackRule) {
            return fallbackRule;
        }

        return null;
    },

    /**
     * Returns the first rule that satisfies the index of the multi geometry.
     * The "sequence" must be an integer with defined min and max values representing the index range.
     * @param   {object[]} rules all rules the satisfy conditions.properties.
     * @param   {integer} index the simple geometries index
     * @returns {object|undefined} the proper rule
     */
    getIndexedRule: function (rules, index) {
        return rules.find(rule => {
            const sequence = rule.hasOwnProperty("conditions") && rule.conditions.hasOwnProperty("sequence") ? rule.conditions.sequence : null,
                isSequenceValid = sequence && Array.isArray(sequence) && sequence.every(element => typeof element === "number") && sequence.length === 2 && sequence[1] >= sequence[0],
                minValue = isSequenceValid ? sequence[0] : -1,
                maxValue = isSequenceValid ? sequence[1] : -1;

            return index >= minValue && index <= maxValue;
        });
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
     * Returning all rules that fit to the feature. Array could be empty.
     * @param {ol/feature} feature the feature to check
     * @returns {object[]} return all rules that fit to the feature
     */
    getRulesForFeature: function (feature) {
        return this.get("rules").filter(rule => this.checkProperties(feature, rule));
    },

    /**
     * Loops one feature through all properties returning true if all properties are satisfied.
     * Returns also true if rule has no "conditions" to check.
     * @param   {ol/feature} feature to check
     * @param {object} rule the rule to check
     * @returns {Boolean} true if all properties are satisfied
     */
    checkProperties: function (feature, rule) {
        if (rule.hasOwnProperty("conditions") && rule.conditions.hasOwnProperty("properties")) {
            const featureProperties = feature.getProperties(),
                properties = rule.conditions.properties;

            let key;

            for (key in properties) {
                const value = properties[key];

                if (!this.checkProperty(featureProperties, key, value)) {
                    return false;
                }
            }

            return true;
        }

        return true;
    },

    /**
     * Checks one feature against one property returning true if property satisfies condition.
     * if clustering is activated, the parameter featureProperties has an array of feautures. only the first feature
     * from the array is relevant at this point, because only individual features are styled here.
     * The styling of clustered features happens in another function.
     * @param   {object} featureProperties properties of the feature that has to be checked
     * @param   {string} key attribute name or object path to check
     * @param   {string|number|array} value attribute value or object path to check
     * @returns {Boolean} true if property is satisfied. Otherwhile returns false.
     */
    checkProperty: function (featureProperties, key, value) {
        let featureProperty = featureProperties;

        // if they are clustered features, then the first one is taken from the array
        if (typeof featureProperties === "object" && featureProperties.hasOwnProperty("features")) {
            if (Array.isArray(featureProperties.features) && featureProperties.features.length > 0) {
                featureProperty = featureProperties.features[0].getProperties();
            }
        }

        const featureValue = this.getFeatureValue(featureProperty, key),
            referenceValue = this.getReferenceValue(featureProperty, value);

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
     * @returns {void} attribute property can be of any type
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
     * @returns {void} attribute property can be of any type
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

            if (!(featureProperty.hasOwnProperty(element) && featureProperty[element])) {
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
     * checks if value starts with special prefix to determine if value is a object path
     * @param   {string} value string to check
     * @returns {Boolean} true is value is an object path
     */
    isObjectPath: function (value) {
        return typeof value === "string" && value.startsWith("@");
    },

    /**
     * Returns an id created from geometryType and conditions using encodeURIComponent.
     * @param   {string} geometryType features geometry type
     * @param   {object} rule         a rule description
     * @returns {string} id
     */
    createLegendId: function (geometryType, rule) {
        const properties = rule.hasOwnProperty("conditions") ? rule.conditions : null;

        return encodeURIComponent(geometryType + JSON.stringify(properties));
    },

    /**
     * Adds a unique legendInfo for each id to this vectorStyle model to be used for legend descriptions.
     * @param {string} geometryType features geometry type needed in legend model
     * @param {vectorStyle/style} styleObject  a vector style needed in
     * @param {Object} rule conditions
     * @returns {void}
     */
    addLegendInfo: function (geometryType, styleObject, rule) {
        const legendInfos = this.get("legendInfos"),
            id = this.createLegendId(geometryType, rule),
            hasLegendInfo = legendInfos.some(legend => {
                return legend.id === id;
            });

        if (!hasLegendInfo) {
            legendInfos.push({
                "id": id,
                "geometryType": geometryType,
                "styleObject": styleObject,
                "label": this.createLegendLabel(rule, styleObject)
            });
        }
    },

    /**
     * Returns the label or null examining some attributes. Giving precedence to "legendValue". Otherwhile creates a string out of rules conditions.
     * @param   {Object} rule conditions
     * @param   {vectorStyle/style} styleObject a vector style needed in
     * @returns {String | null} label for this styleObject
     */
    createLegendLabel: function (rule, styleObject) {
        if (styleObject?.attributes?.hasOwnProperty("legendValue")) {
            return styleObject.attributes.legendValue.toString();
        }
        else if (rule.hasOwnProperty("conditions")) {
            let label = "";

            if (rule.conditions.hasOwnProperty("properties")) {
                label = Object.values(rule.conditions.properties).join(", ");
            }

            if (rule.conditions.hasOwnProperty("sequence") && Array.isArray(rule.conditions.sequence)
            && rule.conditions.sequence.every(element => typeof element === "number") && rule.conditions.sequence.length === 2
            && rule.conditions.sequence[1] >= rule.conditions.sequence[0]) {
                label = label + " (" + rule.conditions.sequence.join("-") + ")";
            }

            return label;
        }

        return null;
    },

    /**
     * returns the legend info
     * @returns {object[]} legend objects
     */
    getLegendInfos: function () {
        return this.get("legendInfos");
    }
});

export default VectorStyleModel;
