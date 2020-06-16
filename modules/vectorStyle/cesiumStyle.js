import StyleModel from "./style.js";

const CesiumStyleModel = StyleModel.extend(/** @lends CesiumStyleModel.prototype */{
    /**
     * @description Class to create ol.style.Style
     * @class CesiumStyleModel
     * @extends StyleModel
     * @memberof VectorStyle.Style
     * @constructs
     * @property {ol/feature} feature Feature to be styled.
     * @property {Object} styles styling properties to overwrite defaults
     * @property {Boolean} isClustered Flag to show if feature is clustered.
     * @property {Object[]} rules The rules of the style.
     */
    defaults: {
        rules: []
    },

    initialize: function (feature, styles, isClustered, rules) {
        this.setFeature(feature);
        this.setIsClustered(isClustered);
        this.overwriteStyling(styles);
        this.setRules(rules);
    },

    /**
    * This function returns a style for each feature.
    * @returns {ol/style} - The created style.
    */
    getStyle: function () {
        const conditions = this.createConditions(this.get("rules"));

        return new Cesium.Cesium3DTileStyle({
            color: {
                conditions: conditions
            }
        });
    },

    createConditions: function (rules) {
        const styleConditions = [];

        rules.forEach(rule => {
            const ruleColor = rule.style.color,
                conditions = [];
            let ruleCondition;

            if (rule.hasOwnProperty("conditions")) {
                Object.keys(rule.conditions).forEach(key => {
                    const value = rule.conditions[key];

                    conditions.push([key, value]);
                });
                ruleCondition = this.createCesiumCondition(conditions);
                styleConditions.push([ruleCondition, ruleColor]);
            }
            else {
                styleConditions.push(["true", ruleColor]);
            }
        });
        return styleConditions;
    },

    createCesiumCondition: function (conditions) {
        let cesiumCondition = [],
            singleCondition = "";

        conditions.forEach(condition => {
            const cesiumKey = "${" + condition[0] + "}";
            let value = condition[1],
                minValue,
                maxValue;

            if (Array.isArray(value)) {
                minValue = value[0];
                maxValue = value[1];
                singleCondition = "(" + cesiumKey + " > " + minValue + " && " + cesiumKey + " <= " + maxValue + ")";
            }
            else {
                if (typeof value === "string") {
                    value = "'" + value + "'";
                }
                singleCondition = cesiumKey + " === " + value;
            }

            cesiumCondition.push(singleCondition);
        });

        cesiumCondition = "(" + cesiumCondition.join(" && ") + ")";

        return cesiumCondition;
    },

    /**
     * Setter for attribute "rules"
     * @param {Object[]} value Rules for styling
     * @returns {void}
     */
    setRules: function (value) {
        this.set("rules", value);
    }
});

export default CesiumStyleModel;
