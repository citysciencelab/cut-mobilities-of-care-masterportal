define(function (require) {

var SnippetModel = require("modules/Snippets/model"),
    DropdownModel = SnippetModel.extend({
        defaults: {
            numOfOptions: 10
        },
    initialize: function () {
        this.superInitialize();
        _.each(this.get("values"), function (value) {
            this.addValue(value);
        }, this);
        this.listenTo(this.get("valuesCollection"), {
            "change:isSelected": function (model) {
                this.trigger("valuesChanged", model);
            }
        });
    },

    addValue: function (value) {
        this.get("valuesCollection").add({
                attr: this.get("name"),
                value: value,
                isSelected: false,
                isSelectable: true,
                type: this.get("type")
            });
    },

    /**
     * set the dropdown value(s)
     * @param  {string[]} value
     */
    setValues: function (value) {
        this.set("values", value);
    },

    /**
     * get the dropdown value(s)
     * @return {string[]}
     */
    getValues: function () {
        return this.get("values");
    },
    setSelectedValues: function (snippetValues) {
        // wenn mehrere values zurück kommt ist snippetValues ein array, wenn nur ein value zurück kommt ein string
        if (typeof snippetValues === "string") {
            snippetValues = [snippetValues];
        }
        _.each(this.get("valuesCollection").models, function (valueModel) {
            if (_.contains(snippetValues, valueModel.get("value"))) {
                valueModel.set("isSelected", true);
            }
            else {
                valueModel.set("isSelected", false);
            }
        });
    },
    updateValues: function (values) {
        var collection = this.get("valuesCollection"),
            modelsToRemove = [];
            // console.log(321);
        // find valueModels to remove
        collection.each(function (model) {

            if (!_.contains(values, model.get("value"))  && !model.get("isSelected")) {
                model.set("isSelectable", false);
            }
        }, this);

        // createModels to add
        _.each(values, function (value) {
            var model = _.find(collection.models, function (model) {
                return model.get("value") === value;
            });
            if (!_.isUndefined(model)) {
                if(model.get("attr") === "bezirk") {
                console.log(model.get("value"));
                // debugger;
                }

                model.set("isSelectable", true);
            }
        }, this);
    }
});

    return DropdownModel;
});
