import BaseModel from "../value/model";

const ValueModel = BaseModel.extend(/** @lends ValueModel.prototype */{
    /**
     * @class ValueModel
     * @extends SnippetModel
     * @memberof Snippets.Slider
     * @constructs
     */
    defaults: Object.assign({}, BaseModel.prototype.defaults, {
        isMin: false,
        initValue: 0
    }),

    /**
     * Setting initial values
     * @returns {void}
     */
    initialize: function () {
        this.setInitValue(this.get("value"));
    },

    /**
     * Returns DisplayName
     * @returns {string} displayName displayName with value
     */
    getDisplayString: function () {
        return this.get("displayName") + " " + this.get("value");
    },

    /**
     * Setter function for isSelected. Called by filter module when filter is removed.
     * @param {integer} value  isSelected
     * @param {boolean} silent isSilent
     * @returns {void}
     */
    setIsSelected: function (value, silent) {
        this.set("isSelected", value);
        if (!value && !silent) {
            this.setValue(this.get("initValue"), true);
            this.trigger("updateDOMSlider");
        }
    },

    /**
     * Setter function for value. Sets also always isSelected.
     * @param {integer} value  initialValue
     * @param {boolean} silent isSilent
     * @returns {void}
     */
    setValue: function (value, silent) {
        if (value !== this.get("initValue") && !silent) {
            this.setIsSelected(true, true);
        }
        else {
            this.setIsSelected(false, true);
        }

        this.set("value", value);
    },

    /**
     * Setter function for initialValue
     * @param {integer} value initialValue
     * @returns {void}
     */
    setInitValue: function (value) {
        this.set("initValue", value);
    }
});

export default ValueModel;
