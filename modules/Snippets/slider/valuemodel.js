define(function (require) {

var ValueModel,
    BaseModel = require("modules/snippets/value/model");

    ValueModel = BaseModel.extend({
    defaults: _.extend({}, BaseModel.prototype.defaults, {
        isMin: false,
        initValue: 0
    }),
    initialize: function () {
        this.setInitValue(this.get("value"));
    },
    resetValue: function () {
        if (this.get("value") !== this.get("initValue")) {
            this.setValue(this.get("initValue"));
        }
        this.trigger("render");
    },
    getDisplayString: function () {
        return this.get("displayName") + " " + this.get("value");
    },
    setIsSelected: function (value) {
        this.set("isSelected", value);
        if (!value) {
            this.resetValue();
        }
    },
    // setter for value
    setValue: function (value) {
        if (value !== this.get("initValue")) {
            this.setIsSelected(true);
        }
        this.set("value", value);

        if (value === this.get("initValue")) {
            this.setIsSelected(false);
        }
    },

    // setter for initValue
    setInitValue: function (value) {
        this.set("initValue", value);
    }
 });
 return ValueModel;
});
