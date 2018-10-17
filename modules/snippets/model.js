import ValueModel from "./value/model";

const Snippet = Backbone.Model.extend({
    defaults: {
        // snippet info text
        infoText: undefined,
        name: "",
        attr: {},
        valuesCollection: {}
    },

    superInitialize: function () {
        this.set("valuesCollection", new Backbone.Collection());

        if ("Config" in window) {
            if (_.has(Config, "infoJson")) {
                this.checkSnippetInfos(Radio.request("Parser", "getSnippetInfos"), this.get("name"));
            }
        }
    },

    /**
     * checks if info text is available and sets it
     * @param {object} snippetInfos [description]
     * @param {string} name [description]
     * @returns {void}
     */
    checkSnippetInfos: function (snippetInfos, name) {
        if (_.has(snippetInfos, name)) {
            this.set("infoText", snippetInfos[name]);
        }
    },

    // setter for id
    setId: function (value) {
        this.set("id", value);
    },

    // setter for name
    setName: function (value) {
        this.set("name", value);
    },

    // setter for attr
    setAttr: function (value) {
        this.set("attr", value);
    },
    removeView: function () {
        this.trigger("removeView");
    },

    // setter for initPreectedValues
    setPreselectedValues: function (value) {
        this.set("preselectedValues", value);
    },

    // setter for type
    setType: function (value) {
        this.set("type", value);
    },

    // setter for displayName
    setDisplayName: function (value) {
        this.set("displayName", value);
    },

    // setter for valuesCollection
    setValuesCollection: function (value) {
        this.set("valuesCollection", value);
    },

    /**
     * returns true if any of the value models is selected
     * @returns {boolean} isSelected
     */
    hasSelectedValues: function () {
        return this.get("valuesCollection").some(function (model) {
            return model.get("isSelected") === true;
        });
    },

    // setter for values
    setValues: function (value) {
        this.set("values", value);
    },

    /**
     * deselects all value models in the values collection
     * @returns {void}
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

export default Snippet;
