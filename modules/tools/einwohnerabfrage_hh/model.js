import Tool from "../../core/modelList/tool/model";
import GraphicalSelectModel from "../../snippets/graphicalselect/model";
import SnippetCheckboxModel from "../../snippets/checkbox/model";

const EinwohnerabfrageModel = Tool.extend(/** @lends EinwohnerabfrageModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        deactivateGFI: true,
        renderToWindow: true,
        checkBoxAddress: undefined,
        checkBoxRaster: undefined,
        drawInteraction: undefined,
        isCollapsed: undefined,
        isCurrentWin: undefined,
        data: {},
        dataReceived: false,
        requesting: false,
        style: "DEFAULT",
        snippetDropdownModel: {},
        metaDataLink: undefined,
        mrhId: "46969C7D-FAA8-420A-81A0-8352ECCFF526",
        fhhId: "B3FD9BD5-F614-433F-A762-E14003C300BF",
        fhhDate: undefined,
        uniqueIdList: [],
        glyphicon: "glyphicon-wrench",
        rasterLayerId: "13023",
        alkisAdressLayerId: "9726",
        populationReqServiceId: "2"
    }),
    /**
     * @class EinwohnerabfrageModel
     * @extends Tool
     * @memberof Tools.Einwohnerabfrage_hh
     * @constructs
     * @property {Boolean} deactivateGFI=true flag for deactivate gfi
     * @property {Boolean} renderToWindow=true render to window for tools
     * @property {*} checkBoxAddress=undefined checkbox snippet for alkis adressen layer
     * @property {*} checkBoxRaster=undefined checkbox snippet for zensus raster layer
     * @property {*} drawInteraction=undefined todo
     * @property {*} isCollapsed=undefined todo
     * @property {*} isCurrentWin=undefined todo
     * @property {Object} data={} todo
     * @property {Boolean} dataReceived=false todo
     * @property {Boolean} requesting=false todo
     * @property {String} style = "default" - style for MasterPortal ("table" - for table View)
     * @property {Object} snippetDropdownModel={}
     * @property {*} metaDataLink=undefined todo
     * @property {String} mrhId="46969C7D-FAA8-420A-81A0-8352ECCFF526" mrh meta data id
     * @property {String} fhhId="B3FD9BD5-F614-433F-A762-E14003C300BF" fhh meta data id
     * @property {*} fhhDate=undefined todo
     * @property {Array} uniqueIdList=[]
     * @property {String} glyphicon="glyphicon-wrench" glyphicon to show
     * @property {String} rasterLayerId="13023" layerId for layer with raster
     * @property {String} alkisAdressLayerId="9726" layerId for the alkis adresses
     * @property {String} populationReqServiceId="2" serviceid
     * @listens Tools.Einwohnerabfrage_hh#ChangeIsActive
     * @listens CswParser#RadioTriggerCswParserFetchedMetaData
     * @listens Snippets.Dropdown#ValuesChanged
     * @listens Snippets.Checkbox#ValuesChanged
     * @listens Core#RadioTriggerModelListUpdateVisibleInMapList
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Tools.Einwohnerabfrage_hh#RenderResult
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioRequestUtilPunctuate
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @fires Core#RadioTriggerMapRegisterListener
     * @fires Core#RadioTriggerMapAddInteraction
     * @fires Core#RadioTriggerWPSRequest
     * @fires Core#RadioRequestModelListGetModelByAttributes
     * @fires Core#RadioTriggerModelListAddModelByAttributes
     * @fires Core#RadioTriggerModelListSetModelAttributesById
     */
    initialize: function () {
        if (Radio.request("Util", "getUiStyle") !== "DEFAULT") {
            this.setStyle("TABLE");
        }
        this.superInitialize();

        this.setCheckBoxAddress(new SnippetCheckboxModel({
            isSelected: false,
            label: "ALKIS Adressen anzeigen (ab 1: 20.000)"
        }));
        this.setCheckBoxRaster(new SnippetCheckboxModel({
            isSelected: false,
            label: "Raster Layer anzeigen (ab 1: 100.000)"
        }));

        this.listenTo(this, {
            "change:isActive": function (isActive) { 
                if(!this.get("isActive")){
                    this.setStatus(this.model, false);
                }
            }
        });
        this.listenTo(Radio.channel("CswParser"), {
            "fetchedMetaData": this.fetchedMetaData
        });
        this.listenTo(this.get("checkBoxRaster"), {
            "valuesChanged": this.toggleRasterLayer
        });
        this.listenTo(this.get("checkBoxAddress"), {
            "valuesChanged": this.toggleAlkisAddressLayer
        });
        this.listenTo(Radio.channel("ModelList"), {
            "updateVisibleInMapList": function () {
                this.checksSnippetCheckboxLayerIsLoaded(this.get("rasterLayerId"), this.get("checkBoxRaster"));
                this.checksSnippetCheckboxLayerIsLoaded(this.get("alkisAdressLayerId"), this.get("checkBoxAddress"));
            }
        });
        this.on("change:isActive", this.handleCswRequests, this);
        this.setDropDownSnippet(new GraphicalSelectModel({id:'Einwohnerabfrage',}));
        this.listenTo(Radio.channel("GraphicalSelect"), {
            "onDrawEnd": function (geoJson) {
                if (this.get("isActive")) {
                    this.makeRequest(geoJson);
                }
            }
        });

        this.setMetaDataLink(Radio.request("RestReader", "getServiceById", this.get("populationReqServiceId")).get("url"));
    },
    resetView: function () {
        Radio.trigger("GraphicalSelect", "resetView");
    },
    /**
     * todo
     * @param {*} cswObj todo
     * @returns {void}
     */
    fetchedMetaData: function (cswObj) {
        if (this.isOwnMetaRequest(this.get("uniqueIdList"), cswObj.uniqueId)) {
            this.removeUniqueIdFromList(this.get("uniqueIdList"), cswObj.uniqueId);
            this.updateMetaData(cswObj.attr, cswObj.parsedData);
        }
    },
    /**
     * todo
     * @param {*} uniqueIdList todo
     * @param {*} uniqueId todo
     * @returns {*} todo
     */
    isOwnMetaRequest: function (uniqueIdList, uniqueId) {
        return _.contains(uniqueIdList, uniqueId);
    },
    /**
     * todo
     * @param {*} uniqueIdList todo
     * @param {*} uniqueId todo
     * @returns {void}
     */
    removeUniqueIdFromList: function (uniqueIdList, uniqueId) {
        this.setUniqueIdList(_.without(uniqueIdList, uniqueId));
    },
    /**
     * todo
     * @param {*} attr todo
     * @param {*} parsedData todo
     * @returns {void}
     */
    updateMetaData: function (attr, parsedData) {
        if (attr === "fhhDate") {
            this.setFhhDate(parsedData.date);
        }
    },

    /**
     * Reset State when tool becomes active/inactive
     * @returns {void}
     */
    reset: function () {
        this.setData({});
        this.setDataReceived(false);
        this.setRequesting(false);
    },

    /**
     * Called when the wps modules returns a request
     * @param  {string} response - the response xml of the wps
     * @param  {number} status - the HTTPStatusCode
     * @fires Tools.Einwohnerabfrage_hh#RenderResult
     * @returns {void}
     */
    handleResponse: function (response, status) {
        var parsedData;

        this.setRequesting(false);
        parsedData = response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData.einwohner;

        if (status === 200) {
            if (parsedData.ErrorOccured === "yes") {
                this.handleWPSError(parsedData);
            }
            else {
                this.handleSuccess(parsedData);
            }
        }
        else {
            this.resetView();
        }
        this.trigger("renderResult");
    },

    /**
     * Displays Errortext if the WPS returns an Error
     * @param  {String} response received by wps
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    handleWPSError: function (response) {
        Radio.trigger("Alert", "alert", JSON.stringify(response.ergebnis));
    },

    /**
     * Used when statuscode is 200 and wps did not return an error
     * @param  {String} response received by wps
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    handleSuccess: function (response) {
        var obj;

        try {
            obj = JSON.parse(response.ergebnis);
            this.prepareDataForRendering(obj);
            this.setData(obj);
            this.setDataReceived(true);
        }
        catch (e) {
            Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + JSON.stringify(response));
            this.resetView();
            (console.error || console.warn).call(console, e.stack || e);
        }
    },

    /**
     * Iterates ofer response properties
     * @param  {object} response - todo
     * @fires Core#RadioRequestUtilPunctuate
     * @returns {void}
     */
    prepareDataForRendering: function (response) {
        _.each(response, function (value, key, list) {
            var stringVal = "";

            if (!isNaN(value)) {
                if (key === "suchflaeche") {
                    stringVal = this.chooseUnitAndPunctuate(value);
                }
                else {
                    stringVal = Radio.request("Util", "punctuate", value);
                }
                list[key] = stringVal;
            }
            else {
                list[key] = value;
            }

        }, this);
    },

    /**
     * Chooses unit based on value, calls panctuate and converts to unit and appends unit
     * @param  {number} value -
     * @param  {number} maxDecimals - decimals are cut after maxlength chars
     * @fires Core#RadioRequestUtilPunctuate
     * @returns {string} unit
     */
    chooseUnitAndPunctuate: function (value, maxDecimals) {
        var newValue;

        if (value < 250000) {
            return Radio.request("Util", "punctuate", value.toFixed(maxDecimals)) + " m²";
        }
        if (value < 10000000) {
            newValue = value / 10000.0;

            return Radio.request("Util", "punctuate", newValue.toFixed(maxDecimals)) + " ha";
        }
        newValue = value / 1000000.0;

        return Radio.request("Util", "punctuate", newValue.toFixed(maxDecimals)) + " km²";
    },


    /**
     * Handles (de-)activation of this Tool
     * @param {object} model - tool model
     * @param {boolean} value flag is tool is ctive
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @returns {void}
     */
    setStatus: function (model, value) {
        if (value) {
            this.checksSnippetCheckboxLayerIsLoaded(this.get("rasterLayerId"), this.get("checkBoxRaster"));
            this.checksSnippetCheckboxLayerIsLoaded(this.get("alkisAdressLayerId"), this.get("checkBoxAddress"));
        }
        Radio.trigger("GraphicalSelect", "setStatus", model, value);
    },

    /**
     * runs the csw requests once and removes this callback from the change:isCurrentWin event
     * because both requests only need to be executed once
     * @returns {void}
     */
    handleCswRequests: function () {
        var metaIds = [
            {
                metaId: this.get("fhhId"),
                attr: "fhhDate"
            }
        ];

        if (this.get("isActive")) {
            _.each(metaIds, function (metaIdObj) {
                var uniqueId = _.uniqueId(),
                    cswObj = {};

                this.get("uniqueIdList").push(uniqueId);
                cswObj.metaId = metaIdObj.metaId;
                cswObj.keyList = ["date"];
                cswObj.uniqueId = uniqueId;
                cswObj.attr = metaIdObj.attr;
                Radio.trigger("CswParser", "getMetaData", cswObj);
            }, this);

            this.off("change:isActive", this.handleCswRequests);
        }
    },
    /**
     * @param  {object} geoJson - todo
     * @fires Tools.Einwohnerabfrage_hh#RenderResult
     * @fires Core#RadioTriggerWPSRequest
     * @returns {void}
     */
    makeRequest: function (geoJson) {
        this.setDataReceived(false);
        this.setRequesting(true);
        this.trigger("renderResult");

        Radio.trigger("WPS", "request", "1001", "einwohner_ermitteln.fmw", {
            "such_flaeche": JSON.stringify(geoJson)
        }, this.handleResponse.bind(this));
    },
    /**
     * todo
     * @param {*} geoJson todo
     * @returns {void}
     */
    prepareData: function (geoJson) {
        var prepared = {};

        prepared.type = geoJson.getType();
        prepared.coordinates = geoJson.geometry;
    },
    /**
     * checks if snippetCheckboxLayer is loaded and toggles the button accordingly
     * @param {String} layerId - id of the addressLayer
     * @param {SnippetCheckboxModel} snippetCheckboxModel - snbippet checkbox model for a layer
     * @fires Core#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    checksSnippetCheckboxLayerIsLoaded: function (layerId, snippetCheckboxModel) {
        var model = Radio.request("ModelList", "getModelByAttributes", { id: layerId }),
            isVisibleInMap = !_.isUndefined(model) ? model.get("isVisibleInMap") : false;

        if (isVisibleInMap) {
            snippetCheckboxModel.setIsSelected(true);
        }
        else {
            snippetCheckboxModel.setIsSelected(false);
        }
    },

    /**
     * show or hide the zensus raster layer
     * @param {boolean} value - true | false
     * @returns {void}
     */
    toggleRasterLayer: function (value) {
        var layerId = this.get("rasterLayerId");

        this.addModelsByAttributesToModelList(layerId);
        if (value) {
            this.checkIsModelLoaded(layerId, this.get("checkBoxRaster"));
        }
        this.setModelAttributesByIdToModelList(layerId, value);
    },

    /**
     * show or hide the alkis adressen layer
     * @param {boolean} value - true | false
     * @returns {void}
     */
    toggleAlkisAddressLayer: function (value) {
        var layerId = this.get("alkisAdressLayerId");

        this.addModelsByAttributesToModelList(layerId);
        if (value) {
            this.checkIsModelLoaded(layerId, this.get("checkBoxAddress"));
        }
        this.setModelAttributesByIdToModelList(layerId, value);
    },

    /**
     * if the model does not exist, add Model from Parser to ModelList via Radio.trigger
     * @param {String} layerId id of the layer to be toggled
     * @fires Core#RadioRequestModelListGetModelByAttributes
     * @fires Core#RadioTriggerModelListAddModelByAttributes
     * @returns {void}
     */
    addModelsByAttributesToModelList: function (layerId) {
        if (_.isEmpty(Radio.request("ModelList", "getModelsByAttributes", { id: layerId }))) {
            Radio.trigger("ModelList", "addModelsByAttributes", { id: layerId });
        }
    },

    /**
     * checks whether the model has been loaded.
     * If it is not loaded, a corresponding error message is displayed and switches snippetCheckbox off
     * @param {String} layerId id of the layer to be toggled
     * @param {SnippetCheckboxModel} snippetCheckboxModel - snippet checkbox model for a layer
     * @fires Core#RadioRequestModelListGetModelByAttributes
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    checkIsModelLoaded: function (layerId, snippetCheckboxModel) {
        if (_.isEmpty(Radio.request("ModelList", "getModelsByAttributes", { id: layerId }))) {
            Radio.trigger("Alert", "alert", "Der Layer mit der ID: " + layerId + " konnte nicht geladen werden, da dieser im Portal nicht zur Verfügung steht!");
            snippetCheckboxModel.setIsSelected(false);
        }
    },

    /**
     * sets selected and visibility to ModelList via Radio.trigger
     * @param {String} layerId id of the layer to be toggled
     * @param {boolean} value - true | false
     * @fires Core#RadioTriggerModelListSetModelAttributesById
     * @returns {void}
     */
    setModelAttributesByIdToModelList: function (layerId, value) {
        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: value,
            isVisibleInMap: value
        });
    },
    /**
     * setter for style
     * @param {string} value - table or default (for master portal)
     * @returns {this} this
     */
    setStyle: function (value) {
        this.set("style", value);
    },

    /**
     * Sets the checkBoxAddress
     * @param {*} value todo
     * @returns {void}
     */
    setCheckBoxAddress: function (value) {
        this.set("checkBoxAddress", value);
    },

    /**
     * Sets the checkBoxRaster
     * @param {*} value todo
     * @returns {void}
     */
    setCheckBoxRaster: function (value) {
        this.set("checkBoxRaster", value);
    },

    /**
     * Sets the data
     * @param {*} value todo
     * @returns {void}
     */
    setData: function (value) {
        this.set("data", value);
    },

    /**
     * Sets the dataReceived
     * @param {*} value todo
     * @returns {void}
     */
    setDataReceived: function (value) {
        this.set("dataReceived", value);
    },

    /**
     * Sets the requesting
     * @param {*} value todo
     * @returns {void}
     */
    setRequesting: function (value) {
        this.set("requesting", value);
    },

    /**
     * Sets the snippetDropdownModel
     * @param {*} value todo
     * @returns {void}
     */
    setDropDownSnippet: function (value) {
        this.set("snippetDropdownModel", value);
    },

    /**
     * Sets the fhhDate
     * @param {*} value todo
     * @returns {void}
     */
    setFhhDate: function (value) {
        this.set("fhhDate", value);
    },

    /**
     * Sets the isCollapsed
     * @param {*} value todo
     * @returns {void}

     */
    setIsCollapsed: function (value) {
        this.set("isCollapsed", value);
    },

    /**
     * Sets the isCurrentWin
     * @param {*} value todo
     * @returns {void}
     */
    setIsCurrentWin: function (value) {
        this.set("isCurrentWin", value);
    },

    /**
     * Sets the uniqueIdList
     * @param {*} value todo
     * @returns {void}
     */
    setUniqueIdList: function (value) {
        this.set("uniqueIdList", value);
    },

    /**
     * Sets the metaDataLink
     * @param {*} value todo
     * @returns {void}
     */
    setMetaDataLink: function (value) {
        this.set("metaDataLink", value);
    },

    /**
     * Sets the loaderPath
     * @param {String} value path to the loader gif
     * @returns {void}
     */
    setLoaderPath: function (value) {
        this.set("loaderPath", value);
    }
});

export default EinwohnerabfrageModel;
