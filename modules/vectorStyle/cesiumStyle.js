import StyleModel from "./style.js";

const CesiumStyleModel = StyleModel.extend(/** @lends CesiumStyleModel.prototype */{
    /**
     * @description Class to create ol.style.Style
     * @class CesiumStyleModel
     * @extends StyleModel
     * @memberof VectorStyle.Style
     * @constructs
     * @property {Object} style styling properties to overwrite defaults
     * @property {Object} conditions styling conditions
     */
    defaults: {
        style: {},
        conditions: {}
    },

    initialize: function (rule) {
        this.overwriteStyling(rule.style);
        this.setConditions(rule.conditions);
    },

    /**
    * This function returns a style for each feature.
    * @returns {ol/style} - The created style.
    */
    getStyle: function () {
        return this.createCondition(this.get("conditions"), this.get("style"));
    },

    /**
     * Creates the cesium tile style conditions.
     * @param {Object} conditions Condition.
     * @param {Object} style Style.
     * @returns {*} - Condition for cesium 3d tile style.
     */
    createCondition: function (conditions, style) {
        const ruleColor = style.color,
            condition = [];
        let ruleCondition;

        if (conditions && Object.keys(conditions).length > 0) {
            Object.keys(conditions).forEach(key => {
                const value = conditions[key];

                condition.push([key, value]);
            });
            ruleCondition = [this.createCesiumConditionForRule(condition), ruleColor];
        }
        else {
            ruleCondition = ["true", ruleColor];
        }
        return ruleCondition;
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
     * Setter fir attribute "conditions"
     * @param {*} conditions conditions
     * @returns {void}
     */
    setConditions: function (conditions) {
        this.set("conditions", conditions);
    }
});

export default CesiumStyleModel;
