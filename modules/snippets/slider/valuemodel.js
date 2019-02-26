import BaseModel from "../value/model";

const ValueModel = BaseModel.extend({
    defaults: _.extend({}, BaseModel.prototype.defaults, {
        isMin: false,
        initValue: 0
    }),
    initialize: function () {
        this.setInitValue(this.get("value"));
    },

    getDisplayString: function () {
        return this.get("displayName") + " " + this.get("value");
    },
    setIsSelected: function (value, silent) {
        this.set("isSelected", value);
        if (!value && !silent) {
            this.setValue(this.get("initValue"), true);
        }
    },
    // setter for value
    setValue: function (value, silent) {
        if (value !== this.get("initValue") && !silent) {
            this.setIsSelected(true, true);
        }
        else {
            this.setIsSelected(false, true);
        }

        this.set("value", value);
    },

    // setter for initValue
    setInitValue: function (value) {
        this.set("initValue", value);
    }
});

export default ValueModel;
