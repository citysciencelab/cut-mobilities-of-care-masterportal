define(function (require) {

var ValueModel = require("modules/snippets/value/model"),
    Config = require("config"),
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

        if (_.has(Config, "infoJson")) {
            this.checkSnippetInfos(Radio.request("Parser", "getSnippetInfos"), this.get("name"));
        }
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

    // getter for initSelectedValues
    getInitSelectedValues: function () {
        return this.get("initSelectedValues");
    },
    // setter for initSelectedValues
    setInitSelectedValues: function (value) {
        this.set("initSelectedValues", value);
    },

    // getter for type
    getType: function () {
        return this.get("type");
    },
    // setter for type
    setType: function (value) {
        this.set("type", value);
    },

    // getter for displayName
    getDisplayName: function () {
        return this.get("displayName");
    },
    // setter for displayName
    setDisplayName: function (value) {
        this.set("displayName", value);
    },

    // getter for valuesCollection
    getValuesCollection: function () {
        return this.get("valuesCollection");
    },
    // setter for valuesCollection
    setValuesCollection: function (value) {
        this.set("valuesCollection", value);
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

    // getter for values
    getValues: function () {
        return this.get("values");
    },
    // setter for values
    setValues: function (value) {
        this.set("values", value);
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
