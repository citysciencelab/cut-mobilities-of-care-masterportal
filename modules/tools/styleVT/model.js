import Tool from "../../core/modelList/tool/model";

const StyleVTModel = Tool.extend(/** @lends StyleWmsModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        isCurrentWin: false,
        isCollapsed: false,
        glyphicon: "glyphicon-tint",
        name: "Style VT",
        id: "styleVT",
        model: null,
        selectedLayerID: undefined,
        vectorTileLayerList: []
    }),

    /**
     * @class StyleWmsModel
     * @description Tool that can modify the style of a WMS.
     * Therefore a sld-body is created and sent via the get-map-request.
     * Caution: Only works for numerical values
     * @extends Tool
     * @memberof Tools.StyleWMS
     * @constructs
     * @property {Boolean} isCurrentWin=false Flag if this tool is shown in the toolwindow and thus is active
     * @property {Boolean} isCollapsed=false Flag if this tool window is collapsed
     * @property {String} glyphicon="glyphicon-tint" Icon that is shown before the tool name
     * @property {String} name="Style WMS" Name of the Tool
     * @property {String} id="StyleWMS" id of Tool
     * @property {String} modelId="" Id of layer model to be styled
     * @property {WmsLayer} model=null Layer model to be styled
     * @property {String} geomType="" Geometry type of data shown in wms layer. important for creating the correct sld
     * @property {String} attributeName="default" Name of attribute to be styled
     * @property {String[]} numberOfClassesList=["1", "2", "3", "4", "5"] Array that defines the maximum amount of styling classes
     * @property {String} numberOfClasses="default" Flag that shows how many styling classes are used
     * @property {styleClassAttribute[]} styleClassAttributes=[] Array of defined styleclassattributes
     * @property {Object} styleClassAttribute One user defined style class
     * @property {Integer} styleClassAttribute.startRange Start of value range to style
     * @property {Integer} styleClassAttribute.stopRange Stop of value range to style
     * @property {String} styleClassAttribute.color Color as hex code
     * @property {String} styleWMSName="" Name of Layer to be styled
     * @property {styleableLayer[]} styleableLayerList=[] List of Layers that can be used for restyling
     * @property {Object} styleableLayer Object containing the name and the id of the styleable layer
     * @property {String} styleableLayer.name Name of styleable Layer
     * @property {String} styleableLayer.id Id of styleable Layer
     * @property {String} wmsSoftware="OGC" Flag of sld has to be created according to ogc standards or in esri style
     * @listens StyleWMS#RadioTriggerStyleWMSopenStyleWMS
     * @listens StyleWMS#changeModel
     * @listens StyleWMS#changeAttributeName
     * @listens StyleWMS#changeNumberOfClasses
     * @listens StyleWMS#changeSetSld
     * @listens List#RadioTriggerModelListUpdatedSelectedLayerList
     * @fires List#RadioRequestModelListGetModelsByAttributes
     * @fires List#RadioTriggerModelListSetModelAttributesById
     * @fires List#RadioRequestModelListGetModelByAttributes
     * @fires Util#RadioRequestUtilGetProxyUrl
     * @fires StyleWMS#RadioTriggerStyleWMSResetParamsStyleWMS
     * @fires StyleWMS#RadioTriggerStyleWMSUpdateParamsStyleWMS
     * @fires StyleWMSModel#sync
     * @fires StyleWMSModel#changeIsactive
     */
    initialize: function () {

        var channel = Radio.channel("StyleVT");

        this.superInitialize();
        channel.on({
            "open": function (model) {

                console.log("on open", model);

                // Check if tool window is already open,if not, open it
                if (this.get("isActive") !== true) {
                    this.setIsActive(true);
                    Radio.trigger("Window", "toggleWin", this);
                }

                // Take layer that is selected in Layer tree
                this.setModel(model);
                console.log("model:", model, "=>", this.get("model"));
                this.trigger("sync");
            }
        }, this);

        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": function () {
                this.refreshVectorTileLayerList();
                if (this.get("isActive") === true) {
                    // if tool is active , refresh the content
                    this.trigger("sync");
                }
            }
        });
    },

    /**
     * Refreshes the styleableLayerList
     * Takes the layermodels that are selected in the layer tree. Takes the layer name and the layer id
     * @fires List#RadioRequestModelListGetModelsByAttributes
     * @returns {void}
     */
    refreshVectorTileLayerList: function () {
        var vectorTileLayerList = [],
            layerModelList,
            result;

        layerModelList = Radio.request("ModelList", "getModelsByAttributes", {typ: "VectorTile", isSelected: true});

        _.each(layerModelList, function (layerModel) {
            vectorTileLayerList.push({name: layerModel.get("name"), id: layerModel.get("id")});
        });

        this.set("vectorTileLayerList", vectorTileLayerList);

        // If current layer model is not selected any more, remove it
        if (this.get("model") !== null && this.get("model") !== undefined) {
            result = _.find(vectorTileLayerList, function (vectorTileLayer) {
                return vectorTileLayer.id === this.get("model").get("id");
            }, this);

            if (result === undefined) {
                this.setModel(null);
            }
        }
    },

    setModelByID: function (id) {
        var model = null;

        if (id !== "") {
            model = Radio.request("ModelList", "getModelByAttributes", {id: id});
        }
        this.setModel(model);
        this.trigger("sync");
    },

    triggerStyleUpdate: function (styleID) {
        this.get("model").setStyle(styleID);
    },

    /**
     * Setter of model
     * @param {Layer} value layer model
     * @returns {void}
     */
    setModel: function (value) {
        this.set("model", value);
    }

});

export default StyleVTModel;
