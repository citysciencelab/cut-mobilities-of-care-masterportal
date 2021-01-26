import Tool from "../../core/modelList/tool/model";

const SaveSelection = Tool.extend(/** @lends SaveSelection.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        zoomLevel: "",
        centerCoords: [],
        layerIDList: [],
        layerVisibilityList: [],
        layerTranseparenceList: [],
        url: "",
        simpleMap: false,
        renderToWindow: true,
        glyphicon: "glyphicon-share",
        // translations
        saveSelectionText: ""
    }),
    /**
     * @class SaveSelection
     * @extends Tool
     * @memberof Tools.SaveSelection
     * @property {String} zoomLevel="" todo
     * @property {Array} centerCoords=[] todo
     * @property {Array} layerIDList=[] todo
     * @property {Array} layerVisibilityList=[] todo
     * @property {Array} layerTranseparenceList=[] todo
     * @property {String} url="" todo
     * @property {Boolean} simpleMap=false todo
     * @property {Boolean} renderToWindow=true todo
     * @property {Boolean} glyphicon="glyphicon-share" todo
     * @property {String} saveSelectionText="", filled with "Speichern Sie diese URL als Lesezeichen ab"- translated
     * @constructs
     * @fires Core#RadioTriggerMapRegisterListener
     */
    initialize: function () {
        const channel = Radio.channel("SaveSelection");

        this.superInitialize();
        channel.reply({
            "getMapState": this.getMapState
        }, this);

        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": this.filterExternalLayer
        });

        this.listenTo(Radio.channel("MapView"), {
            "changedZoomLevel": this.setZoomLevel,
            "changedCenter": this.setCenterCoords
        });

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.setZoomLevel(Radio.request("MapView", "getZoomLevel"));
                    this.setCenterCoords(Radio.request("MapView", "getCenter"));
                    this.filterExternalLayer(Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, type: "layer"}));
                }
            },
            "change:zoomLevel change:centerCoords": this.setUrl,
            "change:url": this.setSimpleMapUrl
        });

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },
    /**
     * change language - sets default values for the language
     * @returns {Void} -
     */
    changeLang: function () {
        this.set({
            saveSelectionText: i18next.t("common:modules.tools.saveSelection.saveSelectionText")
        });
    },

    /**
     * externe Layer werden rausgefiltert
     * @param  {object[]} layerList collection ob backbone layers
     * @returns {void}
     */
    filterExternalLayer: function (layerList) {
        let filteredLayerList = layerList.filter(function (model) {
            return !model.get("isExternal");
        });

        filteredLayerList = Radio.request("Util", "sortBy", filteredLayerList, function (model) {
            return model.get("selectionIDX");
        });

        this.setLayerList(filteredLayerList);
        this.createParamsValues();
    },

    /**
     * [createParamsValues creates url parameters]
     * @return {void}
     */
    createParamsValues: function () {
        const layerVisibilities = [],
            layerTrancparence = [];

        this.get("layerList").forEach(model => {
            layerVisibilities.push(model.get("isVisibleInMap"));
            layerTrancparence.push(model.get("transparency"));
        });

        this.setLayerIdList(this.get("layerList").map(function (elem) {
            return elem.id;
        }));

        this.setLayerTransparencyList(layerTrancparence);
        this.setLayerVisibilityList(layerVisibilities);
        this.setUrl();
    },

    setLayerList: function (value) {
        const getIds = [];
        let withoutUrlFeatures = [];

        if (Config.featureViaURL !== undefined) {
            Config.featureViaURL.layers.forEach(element => {
                getIds.push(element.id);
            });
        }
        withoutUrlFeatures = value.filter((v) => !getIds.includes(v.id));

        this.set("layerList", withoutUrlFeatures);
    },

    setZoomLevel: function (zoomLevel) {
        this.set("zoomLevel", Math.round(zoomLevel));
    },

    setCenterCoords: function (coords) {
        this.set("centerCoords", coords);
    },

    setLayerIdList: function (list) {
        this.set("layerIdList", list);
    },

    setLayerVisibilityList: function (list) {
        this.set("layerVisibilityList", list);
    },

    setLayerTransparencyList: function (list) {
        this.set("layerTransparencyList", list);
    },

    setUrl: function () {
        this.set("url", location.origin + location.pathname + "?layerIDs=" + this.get("layerIdList") + "&visibility=" + this.get("layerVisibilityList") + "&transparency=" + this.get("layerTransparencyList") + "&center=" + this.get("centerCoords") + "&zoomlevel=" + this.get("zoomLevel"));
    },

    setSimpleMapUrl: function (model, value) {
        this.set("simpleMapUrl", value + "&style=simple");
    },

    setSimpleMap: function (value) {
        this.set("simpleMap", value);
    },
    getMapState: function () {
        this.setZoomLevel(Radio.request("MapView", "getZoomLevel"));
        this.setCenterCoords(Radio.request("MapView", "getCenter"));
        this.filterExternalLayer(Radio.request("ModelList", "getModelsByAttributes", {isSelected: true, type: "layer"}));
        return this.get("url");
    }
});

export default SaveSelection;
