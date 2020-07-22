import Tool from "../../core/modelList/tool/model";

const StyleVTModel = Tool.extend(/** @lends StyleVtModel.prototype */{
    defaults: {
        ...Tool.prototype.defaults,
        isCurrentWin: false,
        isCollapsed: false,
        glyphicon: "glyphicon-tint",
        name: "Style VT",
        id: "styleVT",
        model: null,
        selectedLayerID: undefined,
        vectorTileLayerList: [],
        // display strings
        introText: "",
        noStyleableLayers: "",
        theme: "",
        chooseTheme: "",
        style: ""
    },

    /**
     * @class StyleVtModel
     * @description Tool that can change the style of a VTL. Multiple styles
     * can be configured and will be applied on-demand client-side to style the layer.
     * @extends Tool
     * @memberof Tools.StyleVT
     * @constructs
     * @property {Boolean} [isCurrentWin=false] Flag if this tool is shown in the toolwindow and thus is active
     * @property {Boolean} [isCollapsed=false] false Flag if this tool window is collapsed
     * @property {String} [glyphicon="glyphicon-tint"] Icon that is shown before the tool name
     * @property {String} [name="Style VT"] Name of the Tool
     * @property {String} [id="StyleVT"] id of Tool
     * @property {String} [modelId=""] Id of layer model to be styled
     * @property {VtLayer} [model=null] Layer model to be styled
     * @property {String} [geomType=""] Geometry type of data shown in wms layer. important for creating the correct sld
     * @property {String} [attributeName="default"] Name of attribute to be styled
     * @property {styleableLayer[]} [styleableLayerList=[]] List of Layers that can be used for restyling
     * @property {Object} styleableLayer Object containing the name and the id of the styleable layer
     * @property {String} styleableLayer.name Name of styleable Layer
     * @property {String} styleableLayer.id Id of styleable Layer
     * @fires List#RadioRequestModelListGetModelsByAttributes
     * @fires StyleVTModel#sync
     */
    initialize: function () {
        const channel = Radio.channel("StyleVT");

        this.superInitialize();

        channel.on({
            "open": function (model) {
                // Check if tool window is already open; if not, open it
                if (this.get("isActive") !== true) {
                    this.setIsActive(true);
                    Radio.trigger("Window", "toggleWin", this);
                }

                // Take layer that is selected in layer tree
                this.setModel(model);
                this.trigger("sync");
            }
        }, this);

        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": function () {
                this.refreshVectorTileLayerList();
                if (this.get("isActive") === true) {
                    // if tool is active, refresh the content
                    this.trigger("sync");
                }
            }
        });

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang();
    },

    /**
     * Updates model state fields to new translation.
     * @returns {void}
     */
    changeLang: function () {
        this.set({
            "introText": i18next.t("common:modules.tools.styleVT.introText"),
            "noStyleableLayers": i18next.t("common:modules.tools.styleVT.noStyleableLayers"),
            "theme": i18next.t("common:modules.tools.styleVT.theme"),
            "chooseTheme": i18next.t("common:modules.tools.styleVT.chooseTheme"),
            "style": i18next.t("common:modules.tools.styleVT.style")
        });
    },

    /**
     * Refreshes the styleableLayerList.
     * Takes the layermodels that are selected in the layer tree with name/id.
     * @fires List#RadioRequestModelListGetModelsByAttributes
     * @returns {void}
     */
    refreshVectorTileLayerList: function () {
        const vectorTileLayerList = [],
            layerModelList = Radio.request("ModelList", "getModelsByAttributes", {typ: "VectorTile", isSelected: true});

        if (layerModelList) {
            layerModelList.forEach(
                layerModel => vectorTileLayerList.push(
                    {name: layerModel.get("name"), id: layerModel.get("id")}
                )
            );
        }

        this.set("vectorTileLayerList", vectorTileLayerList);

        // If current layer model is not selected any more, remove it
        if (this.get("model") !== null && this.get("model") !== undefined) {
            const modelId = this.get("model").get("id"),
                result = vectorTileLayerList.find(
                    vectorTileLayer => vectorTileLayer.id === modelId
                );

            if (result === undefined) {
                this.setModel(null);
            }
        }
    },

    /**
     * Sets the currently active layer by id.
     * @param {String} id id of a layer
     * @returns {void}
     */
    setModelByID: function (id) {
        let model = null;

        if (id !== "") {
            model = Radio.request("ModelList", "getModelByAttributes", {id});
        }
        this.setModel(model);
        this.trigger("sync");
    },

    /**
     * Sets the style to use to the layer.
     * @param {String} styleID id of style to use
     * @returns {void}
     */
    triggerStyleUpdate: function (styleID) {
        this.get("model").setStyleById(styleID);
    },

    /**
     * Model setter.
     * @param {Layer} value layer model
     * @returns {void}
     */
    setModel: function (value) {
        this.set("model", value);
    }
});

export default StyleVTModel;
