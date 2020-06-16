import StyleModel from "./style.js";

const CesiumStyleModel = StyleModel.extend(/** @lends CesiumStyleModel.prototype */{
    /**
     * @description Class to create ol.style.Style
     * @class CesiumStyleModel
     * @extends StyleModel
     * @memberof VectorStyle.Style
     * @constructs
     * @property {Object} styles styling properties to overwrite defaults
     * @property {Object[]} rules The rules of the style.
     */
    defaults: {
        rules: []
    },

    initialize: function (styles, rules) {
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

    /**
     * Creates the cesium tile style conditions.
     * @param {Object[]} rules Rules.
     * @returns {*} - Conditions for cesium 3d tile style.
     */
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
                ruleCondition = this.createCesiumConditionForRule(conditions);
                styleConditions.push([ruleCondition, ruleColor]);
            }
            else {
                styleConditions.push(["true", ruleColor]);
            }
        });
        return styleConditions;
    },

    /**
     * Creates a cesium condition.
     * @param {*} conditions Conditions.
     * @returns {String[]} - Cesium condition for rule.
     */
    createCesiumConditionForRule: function (conditions) {
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
                singleCondition = "(" + cesiumKey + " === " + value + ")";
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
