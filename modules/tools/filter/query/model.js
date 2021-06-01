import SnippetDropdownModel from "../../../snippets/dropdown/model";
import SnippetSliderModel from "../../../snippets/slider/model";
import SnippetCheckboxModel from "../../../snippets/checkbox/model";
import SnippetMultiCheckboxModel from "../../../snippets/multiCheckbox/model";
import {getDisplayNamesOfFeatureAttributes} from "masterportalAPI/src/rawLayerList";

const QueryModel = Backbone.Model.extend(/** @lends QueryModel.prototype */{

    defaults: {
        featureIds: [],
        isLayerVisible: false,
        activateOnSelection: false,
        searchInMapExtent: true,
        liveZoomToFeatures: false,
        // translations
        result: "",
        results: "",
        filter: "",
        yourSelection: "",
        noFilterOptionSelected: "",
        deleteAll: ""
    },

    /**
     * @class QueryModel
     * @description todo
     * @extends Backbone.Model
     * @memberOf Tools.Filter.Query
     * @constructs
     * @property {Array} featureIds=[] todo
     * @property {boolean} isLayerVisible=false todo
     * @property {boolean} activateOnSelection=false todo
     * @property {boolean} searchInMapExtent=true Flag for the search in the current map extent.
     * @property {boolean} liveZoomToFeatures=false todo
     * @property {String} result: "" contains the translated text
     * @property {String} results: "" contains the translated text
     * @property {String} filter: "" contains the translated text
     * @property {String} yourSelection: "" contains the translated text
     * @property {String} noFilterOptionSelected: "" contains the translated text
     * @property {String} deleteAll: "" contains the translated text
     * @listens i18next#RadioTriggerLanguageChanged
     * @returns {void}
     */
    superInitialize: function () {
        this.setSnippetCollection(new Backbone.Collection());
        this.addIsActiveCheckbox();
        this.listenTo(this.get("snippetCollection"), {
            "valuesChanged": function () {
                this.setIsActive(true);
                this.get("btnIsActive").setIsSelected(true);
                this.runFilter();
                if (this.get("liveZoomToFeatures")) {
                    this.liveZoom();
                }
            }
        }, this);
        this.checkLayerVisibility();
        this.listenTo(Radio.channel("Layer"), {
            "layerVisibleChanged": function (layerId, visible) {
                if (layerId === this.get("layerId")) {
                    this.setIsLayerVisible(visible);
                }
            }
        }, this);
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang();
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        this.set({
            "result": i18next.t("common:modules.tools.filter.result"),
            "results": i18next.t("common:modules.tools.filter.results"),
            "filter": i18next.t("common:modules.tools.filter.filter"),
            "yourSelection": i18next.t("common:modules.tools.filter.yourSelection"),
            "noFilterOptionSelected": i18next.t("common:modules.tools.filter.noFilterOptionSelected"),
            "deleteAll": i18next.t("common:modules.tools.filter.deleteAll"),
            "currentLng": lng
        });
    },

    /**
     * Zooms to an extent of a feature considering the min scale.
     * @returns {void}
     */
    liveZoom: function () {
        const minResolution = Radio.request("MapView", "getResoByScale", this.get("minScale"));

        Radio.trigger("Map", "zoomToFilteredFeatures", this.get("featureIds"), this.get("layerId"), {minResolution});
    },

    isSearchInMapExtentActive: function () {
        const model = this.get("snippetCollection").findWhere({type: "searchInMapExtent"});

        if (model !== undefined && model.getIsSelected() === true) {
            this.runFilter();
        }
    },

    checkLayerVisibility: function () {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});

        if (model !== undefined) {
            this.setIsLayerVisible(model.get("isVisibleInMap"));
        }
    },

    addIsActiveCheckbox: function () {
        if (!this.get("activateOnSelection")) {
            this.setBtnIsActive(new SnippetCheckboxModel({
                isSelected: this.get("isActive")
            }));

            this.listenTo(this.get("btnIsActive"), {
                "valuesChanged": function () {
                    const checkboxModel = this.get("btnIsActive"),
                        isActive = this.get("btnIsActive").getIsSelected();

                    checkboxModel.renderView();
                    this.setIsActive(isActive);
                }
            }, this);
        }
    },

    /**
     * [description]
     * @param  {Object[]} featureAttributesMap Mapping array for feature attributes
     * @return {void}
     */
    addSnippets: function (featureAttributesMap) {
        featureAttributesMap.forEach(featureAttribute => {
            this.addSnippet(featureAttribute);
        });
    },

    addSnippet: function (featureAttribute) {
        let snippetAttribute = featureAttribute,
            isSelected = false;

        snippetAttribute.values = Radio.request("Util", "sort", "", snippetAttribute.values);
        if (snippetAttribute.type === "string" || snippetAttribute.type === "text") {
            snippetAttribute = Object.assign(snippetAttribute, {"snippetType": "dropdown"});
            this.get("snippetCollection").add(new SnippetDropdownModel(snippetAttribute));
        }
        else if (snippetAttribute.type === "boolean") {
            if (snippetAttribute.hasOwnProperty("preselectedValues")) {
                isSelected = snippetAttribute.preselectedValues[0];
            }
            snippetAttribute = Object.assign(snippetAttribute, {"snippetType": "checkbox", "label": snippetAttribute.displayName, "isSelected": isSelected});
            this.get("snippetCollection").add(new SnippetCheckboxModel(snippetAttribute));
        }
        else if (snippetAttribute.type === "integer" || snippetAttribute.type === "decimal") {
            snippetAttribute = Object.assign(snippetAttribute, {"snippetType": "slider"});
            this.get("snippetCollection").add(new SnippetSliderModel(snippetAttribute));
        }
        else if (snippetAttribute.type === "checkbox-classic") {
            snippetAttribute = Object.assign(snippetAttribute, {"snippetType": snippetAttribute.type});
            snippetAttribute.type = "string";
            snippetAttribute.layerId = this.get("layerId");
            snippetAttribute.isInitialLoad = this.get("isInitialLoad");
            this.get("snippetCollection").add(new SnippetMultiCheckboxModel(snippetAttribute));
        }
    },
    /**
     * adds a snippet for the map extent search
     * @return {void}
     */
    addSearchInMapExtentSnippet: function () {
        this.get("snippetCollection").add(new SnippetCheckboxModel({
            type: "searchInMapExtent",
            isSelected: false,
            label: "Suche im aktuellen Kartenausschnitt"
        }));
    },

    /**
     * Creates one or more Snippets, where Snippets like DropDowns or Sliders
     * @param  {object[]} featureAttributes feature attributes
     * @return {void}
     */
    createSnippets: function (featureAttributes) {
        let featureAttributesMap = this.trimAttributes(featureAttributes);

        featureAttributesMap = this.mapDisplayNames(featureAttributesMap);
        featureAttributesMap = this.collectSelectableOptions(this.get("features"), [], featureAttributesMap);
        featureAttributesMap = this.mapRules(featureAttributesMap, this.get("rules"));

        this.setFeatureAttributesMap(featureAttributesMap);
        this.addSnippets(featureAttributesMap);
        if (this.get("isSelected") === true) {
            this.runFilter();
            if (this.get("liveZoomToFeatures")) {
                this.liveZoom();
            }
            this.trigger("renderDetailView");
        }
    },

    /**
     * Entfernt alle Attribute die nicht in der Whitelist stehen
     * @param  {object} featureAttributesMap - Mapobject
     * @return {object} featureAttributesMap - gefiltertes Mapobject
     */
    trimAttributes: function (featureAttributesMap) {
        const trimmedFeatureAttributesMap = [],
            whiteList = this.get("attributeWhiteList"),
            whiteListAttributes = Array.isArray(whiteList) ? whiteList : Object.keys(whiteList);
        let featureAttribute;

        whiteListAttributes.forEach(attr => {
            const attrObj = this.createAttrObject(attr);

            featureAttribute = Radio.request("Util", "findWhereJs", featureAttributesMap, {name: attrObj.name});
            if (featureAttribute !== undefined) {
                featureAttribute.matchingMode = attrObj.matchingMode;
                trimmedFeatureAttributesMap.push(featureAttribute);
            }
        });

        return trimmedFeatureAttributesMap;
    },

    createAttrObject: function (attr) {
        let attrObj = {};

        if (typeof attr === "string") {
            attrObj.name = attr;
            attrObj.matchingMode = "OR";
        }
        else if (attr.hasOwnProperty("name") && attr.hasOwnProperty("matchingMode")) {
            attrObj = attr;
        }
        return attrObj;
    },
    /**
     * Konfigurierter Labeltext wird den Features zugeordnet
     * @param  {object} featureAttributesMap - Mapobject
     * @return {object} featureAttributesMap - gefiltertes Mapobject
     */
    mapDisplayNames: function (featureAttributesMap) {
        const attributeNames = getDisplayNamesOfFeatureAttributes(this.get("layerId")),
            whiteList = this.get("attributeWhiteList"),
            displayNames = Array.isArray(whiteList) ? attributeNames : whiteList;

        featureAttributesMap.forEach(featureAttribute => {
            if (displayNames instanceof Object && displayNames.hasOwnProperty(featureAttribute.name) === true) {
                featureAttribute.displayName = displayNames[featureAttribute.name];
            }
            else {
                featureAttribute.displayName = featureAttribute.name;
            }
        });

        return featureAttributesMap;
    },

    /**
     * adds values that should be initially selected (rules) to the map object
     * @param  {object[]} [featureAttributesMap={}] - Mapobject
     * @param  {object[]} [rules=[]] - contains values to be added
     * @return {object} featureAttributesMap
     */
    mapRules: function (featureAttributesMap = [], rules = []) {
        let attrMap;

        rules.forEach(rule => {
            attrMap = Radio.request("Util", "findWhereJs", featureAttributesMap, {name: rule.attrName});

            if (attrMap) {
                attrMap.preselectedValues = rule.values;
            }
        });

        return featureAttributesMap;
    },

    /**
     * iterates over the snippet collection and
     * calls in the snippet deselectValueModels
     * @return {void}
     */
    deselectAllValueModels: function () {
        const snippetCollection = this.get("snippetCollection");

        snippetCollection.forEach(snippet => {
            snippet.deselectValueModels();
        });
    },

    setFeatureAttributesMap: function (value) {
        this.set("featureAttributesMap", value);
    },

    // setter for isDefault
    setIsDefault: function (value) {
        this.set("isDefault", value);
    },
    selectThis: function () {
        if (!this.get("isSelected")) {
            // the query collection listens to this trigger in the filter model
            this.collection.trigger("deselectAllModels", this);
            this.collection.trigger("deactivateAllModels", this);
            this.setIsSelected(true);
            if (this.get("isActive")) {
                this.runFilter();
                if (this.get("liveZoomToFeatures")) {
                    this.liveZoom();
                }
            }
        }
        else {
            this.setIsSelected(false);
            if (this.get("activateOnSelection")) {
                this.runFilter();
            }
        }
    },

    setIsSelected: function (value) {
        if (this.get("activateOnSelection")) {
            this.setIsActive(value);
        }
        this.set("isSelected", value);
    },

    setIsActive: function (value) {
        this.set("isActive", value);
    },

    setFeatureIds: function (value) {
        this.set("featureIds", value);
    },
    setIsNoValueSelected: function (value) {
        this.set("isNoValueSelected", value);
    },
    setIsLayerVisible: function (value) {
        this.set("isLayerVisible", value);
    },

    setActivateOnSelection: function (value) {
        this.set("activateOnSelection", value);
    },

    // setter for snippetCollection
    setSnippetCollection: function (value) {
        this.set("snippetCollection", value);
    },

    // setter for btnIsActive
    setBtnIsActive: function (value) {
        this.set("btnIsActive", value);
    },

    // setter for liveZoomToFeatures
    setLiveZoomToFeatures: function (value) {
        this.set("liveZoomToFeatures", value);
    },

    // setter for layerId
    setLayerId: function (value) {
        this.set("layerId", value);
    },

    // setter for features
    setFeatures: function (value) {
        this.set("features", value);
    },

    // setter for rules
    setRules: function (value) {
        this.set("rules", value);
    },

    // setter for attributeWhiteList
    setAttributeWhiteList: function (value) {
        this.set("attributeWhiteList", value);
    },

    // setter for isInitialLoad
    setIsInitialLoad: function (value) {
        this.set("isInitialLoad", value);
    }
});

export default QueryModel;
