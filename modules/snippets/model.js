import ValueModel from "./value/model";

const SnippetModel = Backbone.Model.extend(/** @lends SnippetModel.prototype */{
    /**
     * @class SnippetModel
     * @extends Backbone.Model
     * @memberof Snippets
     * @constructs
     * @property {object} infoText ToDo
     * @property {string} name="" ToDo
     * @property {object} attr ToDo
     * @property {object} valuesCollection ValuesCollection der children
     * @fires Parser#RadioRequestParserGetSnippetInfos
     */
    defaults: {
        infoText: undefined,
        name: "",
        attr: {},
        valuesCollection: {}
    },

    /**
     * Initialize after Child-Initialize
     * @returns {void}
     */
    superInitialize: function () {
        this.set("valuesCollection", new Backbone.Collection());

        if (typeof Config !== "undefined" && Config.hasOwnProperty("infoJson")) {
            this.checkSnippetInfos(Radio.request("Parser", "getSnippetInfos"), this.get("name"));
        }
    },

    /**
     * Checks if info text is available and sets it
     * @param {object} snippetInfos [description]
     * @param {string} name [description]
     * @returns {void}
     */
    checkSnippetInfos: function (snippetInfos, name) {
        if (snippetInfos.hasOwnProperty(name)) {
            this.set("infoText", snippetInfos[name]);
        }
    },

    /**
     * Trigger removeView
     * @returns {void}
     */
    removeView: function () {
        this.trigger("removeView");
    },

    /**
     * Returns true if any of the value models is selected
     * @returns {boolean} isSelected
     */
    hasSelectedValues: function () {
        return this.get("valuesCollection").some(function (model) {
            return model.get("isSelected") === true;
        });
    },

    /**
     * Deselects all value models in the values collection
     * @returns {void}
     */
    deselectValueModels: function () {
        this.get("valuesCollection").forEach(function (model) {
            model.setIsSelected(false);
        });
    },

    /**
     * Extent Object with new ValueModel
     * @param   {object} obj Object to be extended
     * @returns {object} object extended Object
     */
    extentBaseModel: function (obj) {
        return Object.assign({}, new ValueModel(), obj);
    },

    /**
     * Trigger valuesChanged to children
     * @fires Snippets#ValuesChanged
     * @param   {object} model Model to be transmitted
     * @param   {string} value Value to be transmitted
     * @returns {void}
     */
    triggerValuesChanged: function (model, value) {
        this.trigger("valuesChanged", model, value);
    },

    /**
     * Setter for id
     * @param {string} value id
     * @returns {void}
     */
    setId: function (value) {
        this.set("id", value);
    },

    /**
     * Setter for name
     * @param {string} value name
     * @returns {void}
     */
    setName: function (value) {
        this.set("name", value);
    },

    /**
     * Setter for attr
     * @param {string} value attr
     * @returns {void}
     */
    setAttr: function (value) {
        this.set("attr", value);
    },


    /**
     * Setter for preselectedValues
     * @param {string} value preselectedValues
     * @returns {void}
     */
    setPreselectedValues: function (value) {
        this.set("preselectedValues", value);
    },

    /**
     * Setter for type
     * @param {string} value type
     * @returns {void}
     */
    setType: function (value) {
        this.set("type", value);
    },

    /**
     * Setter for displayName
     * @param {string} value displayName
     * @returns {void}
     */
    setDisplayName: function (value) {
        this.set("displayName", value);
    },

    /**
     * Setter for valuesCollection
     * @param {string} value valuesCollection
     * @returns {void}
     */
    setValuesCollection: function (value) {
        this.set("valuesCollection", value);
    },

    /**
     * Setter for values
     * @param {string} value values
     * @returns {void}
     */
    setValues: function (value) {
        this.set("values", value);
    }
});

export default SnippetModel;
