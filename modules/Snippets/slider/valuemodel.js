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

    getDisplayString: function () {console.log(this.get("value"));
        return this.get("displayName") + " " + this.get("value");
    },
    setIsSelected: function (value) {
        this.set("isSelected", value);
        if (!value) {
            this.setValue(this.get("initValue"));
        }
    },
    // setter for value
    setValue: function (value) {
        if (value !== this.get("initValue")) {
            this.setIsSelected(true);
        }
        console.log(value);
        this.set("value", value);
    },

    // setter for initValue
    setInitValue: function (value) {
        this.set("initValue", value);
    }
 });
 return ValueModel;
});
