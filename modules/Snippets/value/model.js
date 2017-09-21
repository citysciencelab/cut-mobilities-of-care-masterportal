define(function (require) {

var Model = Backbone.Model.extend({
        defaults: {
            value: "",
            attribute: "",
            displayString: "",
            type: ""
        },
        // setter for value
        setValue: function (value) {
            this.set("value", value);
        },
        resetValueModels: function () {
            this.trigger("resetValueModels");
        },
        setIsSelected: function (value) {
            this.set("isSelected", value);
        },
        getDisplayString: function () {
            var displayString = "";
            this.get("isMin");
            switch (this.get("type")) {
                case "boolean": {
                    displayString = this.get("attr");
                    break;
                }
                default: {
                    displayString += this.get("value");
                }
            }
            return displayString;
        }
    });

    return Model;
});
