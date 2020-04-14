const StyleModel = Backbone.Model.extend(/** @lends StyleModel.prototype */{
    /**
     * @description Class to maintain some methods.
     * @class PolygonStyleModel
     * @extends Backbone.Model
     * @memberof VectorStyle
     * @constructs
     */
    defaults: {},

    /*
    * setter for feature
    * @param {ol/feature} value feature
    * @returns {void}
    */
    setFeature: function (value) {
        this.set("feature", value);
    },

    /*
    * setter for isClustered
    * @param {Boolean} value isClustered
    * @returns {void}
    */
    setIsClustered: function (value) {
        this.set("isClustered", value);
    },

    /*
    * setter for styles
    * @param {object} styles styles
    * @returns {void}
    */
    overwriteStyling: function (styles) {
        let key;

        for (key in styles) {
            const value = styles[key];

            this.set(key, value);
        }
    },
    /**
     * Returns the value of the given field. Also considers that the field can be an object path.
     * @param {Object} featureProperties Feature properties.
     * @param {String} field Field to get value.
     * @returns {*} - Value from given field.
     */
    prepareField: function (featureProperties, field) {
        const isPath = field.startsWith("@");
        let value = field;

        if (isPath) {
            value = this.getValueFromPath(featureProperties, value);
        }
        else {
            value = featureProperties && featureProperties.hasOwnProperty(field) ? featureProperties[field] : "undefined";
        }
        return value;
    },

    /**
     * Returns the value from the given path.
     * @param {Object} featureProperties Feature properties.
     * @param {String} path Field as object path.
     * @returns {*} - Value from given path.
     */
    getValueFromPath: function (featureProperties, path) {
        const pathParts = path.substring(1).split(".");
        let property = featureProperties,
            value = "undefined";

        pathParts.forEach(part => {
            property = property ? property[part] : undefined;
        });

        if (property) {
            value = property;
        }
        return value;
    }
});

export default StyleModel;
