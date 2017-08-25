define(function (require) {

var SnippetModel = require("modules/Snippets/model"),
    DropdownModel = SnippetModel.extend({
    initialize: function () {
        this.superInitialize();
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
        this.trigger("valuesChanged");
    }
});

    return DropdownModel;
});
