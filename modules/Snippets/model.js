define(function (require) {

var ValueModel = require("modules/Snippets/value/model"),
    Snippet = Backbone.Model.extend({
    defaults: {
        // snippet info text
        infoText: undefined,
        name: "",
        attr: {},
        valuesCollection: {}
    },

    superInitialize: function () {
        this.set("valuesCollection", new Backbone.Collection());

        this.checkSnippetInfos(Radio.request("Parser", "getSnippetInfos"), this.get("name"));
    },

    /**
     * checks if info text is available and sets it
     * @param {object} snippetInfos
     * @param {string} name [description]
     */
    checkSnippetInfos: function (snippetInfos, name) {
        if (_.has(snippetInfos, name)) {
            this.set("infoText", snippetInfos[name]);
        }
    },

    // getter for id
    getId: function () {
        return this.get("id");
    },
    // setter for id
    setId: function (value) {
        this.set("id", value);
    },
    // getter for name
    getName: function () {
        return this.get("name");
    },
    // setter for name
    setName: function (value) {
        this.set("name", value);
    },
    // getter for attr
    getAttr: function () {
        return this.get("attr");
    },
    // setter for attr
    setAttr: function (value) {
        this.set("attr", value);
    },
    removeView: function () {
        this.trigger("removeView");
    },
    /**
     * returns true if any of the value models is selected
     * @return {boolean}
     */
    hasSelectedValues: function () {
        return this.get("valuesCollection").some(function (model) {
            return model.get("isSelected") === true;
        });
    },

    /**
     * deselects all value models in the values collection
     */
    deselectValueModels: function () {
        this.get("valuesCollection").forEach(function (model) {
            model.setIsSelected(false);
        });
    },
    extentBaseModel: function (obj) {
        return _.extend({}, new ValueModel(), obj);
    },
    triggerValuesChanged: function (model, value) {
        this.trigger("valuesChanged", model, value);
    }
 });

return Snippet;
});
