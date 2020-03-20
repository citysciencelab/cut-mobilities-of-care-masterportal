const TreeModel = Backbone.Model.extend(/** @lends TreeModel.prototype */{
    defaults: {
        inUse: false,
        minChars: 3,
        layers: [],
        nodes: []
    },
    /**
     * @class TreeModel
     * @extends Backbone.Model
     * @memberOf Searchbar.Tree
     * @constructs
     * @param {object} config - Config parameters from config.json for searching in layer tree.
     * @property {boolean} inUse=false todo
     * @property {number} minChars=3 Minimum number of characters to start the search.
     * @property {object[]} layers=[] todo
     * @property {object[]} nodes=[] todo
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @fires Core#RadioRequestParametricURLGetInitString
     * @listens Searchbar#RadioTriggerSearchbarSearch
     * @listens Core#RadioTriggerObliqueMapIsActivated
     */
    initialize: function (config) {
        if (config.minChars) {
            this.set("minChars", config.minChars);
        }

        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });
        this.listenTo(Radio.channel("ObliqueMap"), {
            "isActivated": this.controlListeningToSearchbar
        });

        if (Radio.request("ParametricURL", "getInitString") !== undefined) {
            // Carry out the initial search because a search parameter has been passed.
            this.search(Radio.request("ParametricURL", "getInitString"));
        }

    },

    /**
     * Deactivates the topic search if the obliqueMap is activated.
     * Enables topic search when obliqueMap is disabled.
     * @param {boolean} value - includes whether the obliqueMap is active
     * @return {void}
     */
    controlListeningToSearchbar: function (value) {
        if (value) {
            this.stopListening(Radio.channel("Searchbar"), "search");
        }
        else {
            this.listenTo(Radio.channel("Searchbar"), {
                "search": this.search
            });
        }
    },

    /**
     * Searches for hits for the search string in layer models.
     * @param {string} searchString - The input in the search bar.
     * @fires Core.ConfigLoader#RadioRequestParserGetItemsByAttributes
     * @fires Searchbar#RadioTriggerSearchbarCreateRecommendedList
     * @returns {void}
     */
    search: function (searchString) {
        let searchStringRegExp = "",
            layersForSearch = [],
            uniqueLayerModels = [];

        if (this.get("layers").length === 0) {
            uniqueLayerModels = this.getUniqeLayermodels(Radio.request("Parser", "getItemsByAttributes", {type: "layer"}));
            layersForSearch = this.getLayerForSearch(uniqueLayerModels);
            this.setLayers(layersForSearch);
        }
        if (this.get("inUse") === false && searchString.length >= this.get("minChars")) {
            this.set("inUse", true);
            searchStringRegExp = new RegExp(searchString.replace(/ /g, ""), "i"); // Erst join dann als regulärer Ausdruck
            this.searchInLayers(searchStringRegExp);
            this.searchInNodes(searchStringRegExp);
            Radio.trigger("Searchbar", "createRecommendedList", "tree");
            this.set("inUse", false);
        }
    },
    /**
     * @description Führt die Suche in der Nodesvariablen aus.
     * @param {string} searchStringRegExp - Suchstring als RegExp
     * @returns {void}
     */
    searchInNodes: function (searchStringRegExp) {
        var nodes = _.uniq(this.get("nodes"), function (node) {
            return node.name;
        });

        _.each(nodes, function (node) {
            var nodeName = node.name.replace(/ /g, "");

            if (nodeName.search(searchStringRegExp) !== -1) {
                Radio.trigger("Searchbar", "pushHits", "hitList", node);
            }
        }, this);
    },

    /**
     * Executes the search in the layer variable with search string and finds in the layer name and dataset name.
     * @param {string} searchStringRegExp - Suchstring as RegExp.
     * @fires Searchbar#RadioTriggerSearchbarPushHits
     * @returns {void}
     */
    searchInLayers: function (searchStringRegExp) {
        this.get("layers").forEach(layer => {
            var searchString = "";

            if (layer.metaName !== undefined) {
                searchString = layer.metaName.replace(/ /g, "");
            }
            else if (layer.name !== undefined) {
                searchString = layer.name.replace(/ /g, "");
            }

            if (searchString.search(searchStringRegExp) !== -1) {
                Radio.trigger("Searchbar", "pushHits", "hitList", layer);
            }
        });
    },

    /**
     * Duplicate layers are removed so that each layer appears only once in the search,
     * even if it is contained in several categories
     * and several times if it exists several times with different records
     * @param {object[]} [layerModels=[]] - LightModels of the itemList from Parser.
     * @param {string} layerModels[].name - The name of a layer model.
     * @param {string} layerModels[].id - The id of a layer model.
     * @returns {object[]} uniqueModels - Unique LightModels of the itemList from Parser.
     */
    getUniqeLayermodels: function (layerModels = []) {
        return layerModels.filter((model, index) => {
            const firstLayermodel = layerModels.find(element => element.id === model.id && element.name === model.name);

            return layerModels.indexOf(firstLayermodel) === index;
        });
    },

    /**
     * Creates new models for the search from the layerModels.
     * @param {object[]} [layerModelsUniqe=[]] - Unique LightModels of the itemList from Parser.
     * @param {string} layerModels[].name - The name of a layer model.
     * @param {string} layerModels[].id - The id of a layer model.
     * @returns {object[]} Layers for search.
     */
    getLayerForSearch: function (layerModelsUniqe = []) {
        const layersForsearch = [];

        layerModelsUniqe.forEach(model => {
            layersForsearch.push({
                name: model.name,
                metaName: model.hasOwnProperty("datasets") && model.datasets[0].hasOwnProperty("md_name") ? model.name + " (" + model.datasets[0].md_name + ")" : model.name,
                type: i18next.t("common:modules.searchbar.type.topic"),
                glyphicon: "glyphicon-list",
                id: model.id
            });
        });

        return layersForsearch;
    },

    /**
     * Setter for layers.
     * @param {object[]} layers - Layers for search.
     * @returns {void}
     */
    setLayers: function (layers) {
        this.set("layers", layers);
    }
});

export default TreeModel;
