import {Select} from "ol/interaction.js";
import Tool from "../../core/modelList/tool/model";
import {WFS} from "ol/format.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Feature} from "ol";
import getProxyUrl from "../../../src/utils/getProxyUrl";
import store from "../../../src/app-store/index";

const WfstModel = Tool.extend(/** @lends WfstModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        deactivateGFI: true,
        modelId: "WFS-T",
        channel: Radio.channel("wfst"),
        activeButton: "",
        buttonConfig: [true, true, true],
        initialButtonTitleConfig: ["Punkt erfassen", "Linie erfassen", "Fläche erfassen", "aktueller Layer:"],
        buttonTitleConfig: [],
        editButton: true,
        editButtonTitle: "Geometrie bearbeiten",
        deleteButton: true,
        deleteButtonTitle: "Geometrie löschen",
        layerIds: [],
        activeLayers: {},
        currentLayerId: null,
        showAttrTable: false,
        showCancel: false,
        initialAlertCases: [],
        alertCases: [],
        exceptionCodes: ["InvalidValue", "OperationParsingFailed", "OperationProcessingFailed", "OperationNotSupported", "MissingParameterValue", "InvalidParameterValue", "OperationNotSupported"],
        url: "",
        featureType: "",
        version: "",
        featureNS: "",
        feautrePrefix: "",
        isSecured: false,
        wfstFields: [],
        attributesField: {},
        featureProperties: {},
        showInfoText: false,
        geometryName: null,
        incorrectConfigLayers: [],
        missingLayers: [],
        editInteraction: new Select(),
        currentFeature: null,
        successfullTransaction: "",
        vectorLayer: new VectorLayer(),
        source: new VectorSource(),
        toggleLayer: false,
        isDeselectedLayer: false,
        useProxy: false
    }),

    /**
     * @class WfstModel
     * @extends Tool
     * @memberof Tools.Wfst
     * @constructs
     * @property {Boolean} deactivateGFI=true - flag for deactivate gfi
     * @property {String} modelId="WFS-T" - Id of the model
     * @property {Radio.channel} channel=Radio.channel("wfst") - Radio channel name
     * @property {String} activeButton="" - the current active button
     * @property {Boolean[]} buttonConfig=[true, true, true] - Array with Flags for displaying the feature generating buttons (point, line, area)
     * @property {String[]} initialButtonTitleConfig=["Punkt erfassen", "Linie erfassen", "Fläche erfassen", "aktueller Layer:"] - Array with default captions for feature generating buttons and layerSelect
     * @property {String[]} buttonTitleConfig=[] - Array with configured captions for feature generating buttons
     * @property {Boolean} editButton=true - Flag for displaying the edit button
     * @property {String} editButtonTitle="Geometrie bearbeiten" - Default caption for edit button
     * @property {Boolean} deleteButton=true - Flag for displaying the delete button
     * @property {String} deleteButtonTitle="Geometrie löschen" - Default caption for delete button
     * @property {String[]} layerIds=[] - Array with all configured layer ids for the wfst tool
     * @property {Object} activeLayers={} - All configured layer ids that are selected in the layer tree
     * @property {String} currentLayerId=null - Id of the layer that is currently active in the tool
     * @property {Boolean} showAttrTable=false - Flag if the attribute table is shown
     * @property {Boolean} showCancel=false - Flag if the cancel button is shown
     * @property {String[]} initialAlertCases=[] - Array that collects all error cases that prevent the tool from opening
     * @property {String[]} alertCases=[] - Array that collects alert cases
     * @property {String[]} exceptionCodes=["InvalidValue", "OperationParsingFailed", "OperationProcessingFailed", "OperationNotSupported", "MissingParameterValue", "InvalidParameterValue", "OperationNotSupported"] - Array with all exeption codes, that are considered
     * @property {String} url="" - Url of the current active wfs Layer
     * @property {String} featureType="" - featureType of the current active wfs Layer
     * @property {String} version="" - version of the current active wfs Layer
     * @property {String} featureNS="" - featureNS of the current active wfs Layer
     * @property {String} featurePrefix="" - featurePrefix of the current active wfs Layer
     * @property {Boolean} isSecured=false - flag if the current active wfs Layer is secured
     * @property {Object[]} wfstFields=[] - Array with all informations for the input fields
     * @property {Object} attributesField={} - Attributes of the current feature type
     * @property {Object} featureProperties={} - Values of the attribute table
     * @property {Boolean} showInfoText=false - Flag if the info tag should be shown
     * @property {String} geometryName=null - name of the geometry property of the current feature
     * @property {Object[]} incorrectConfigLayers=[] - Array with ids of incorrect configured layers
     * @property {String[]} missingLayers=[] - Array with ids of layers that are missing in the modelList yet
     * @property {ol.Select} editInteraction=new Select() - Select
     * @property {null} currentFeature=null - the current feature
     * @property {String} successfullTransaction="" - identifies whether a transaction was successfull
     * @property {ol.VectorLayer} vectorLayer=new VectorLayer() - VectorLayer
     * @property {ol.VectorSource} source=new VectorSource() - VectorSource
     * @property {Boolean} toggleLayer=false - Flag if the current layer should be toggled
     * @property {Boolean} isDeselectedLayer=false - Flag if the current layer is deselected in the layer tree
     * @property {Boolean} useProxy=false Attribute to request the URL via a reverse proxy.
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerUtilShowLoader
     * @fires Core#RadioTriggerUtilHideLoader
     * @fires Map#RadioTriggerMapRemoveInteraction
     * @listens Tools.Wfst#RadioTriggerWfstTransact
     */
    initialize: function () {
        this.superInitialize();
        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": this.updateAvailableLayers
        });

        this.listenTo(this.get("channel"), {
            "transact": this.externTransaction
        }, this);

        this.setParameters();
    },

    /**
     * Executes an extern wfs transaction
     * @param {String} layerId - id of the affected layer
     * @param {String} featureId - id of the affected feature
     * @param {String} mode - transaction mode insert|update|delete
     * @param {Object} attributes - feature attributes to be changed
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    externTransaction: function (layerId, featureId, mode, attributes) {
        const model = Radio.request("ModelList", "getModelByAttribute", {id: layerId});
        let feature,
            xmlString;

        if (model !== undefined) {
            feature = model.get("layer").getSource().getFeatureById(featureId);
            if (feature === null) {
                feature = new Feature();
            }
            feature.setProperties(attributes);
            feature.unset("extent");
            xmlString = this.transactionWFS(mode, feature);
            this.sendTransaction(xmlString);
        }
    },

    /**
     * Handle the parameters that are configured
     * @returns {void}
     */
    setParameters: function () {
        const deleteConfig = this.get("delete"),
            editConfig = this.get("edit"),
            deleteEdit = this.handleEditDeleteButton(deleteConfig, editConfig),
            layerIds = this.handleAvailableLayers(this.get("layerIds"), this.get("initialAlertCases"));

        this.setDeleteButton(deleteEdit[0][0]);
        this.setEditButton(deleteEdit[0][1]);
        this.setDeleteButtonTitle(deleteEdit[1][0]);
        this.setEditButtonTitle(deleteEdit[1][1]);
        this.setLayerIds(layerIds);
    },

    /**
     * Handles the configurations for the captions and for the displaying of the edit and delete button
     * @param {String/Boolean} deleteConfig - configuration for the delete Button
     * @param {String/Boolean} editConfig - configuration for the edit Button
     * @returns {void}
     */
    handleEditDeleteButton: function (deleteConfig, editConfig) {
        const deleteEditTitle = [this.get("deleteButtonTitle"), this.get("editButtonTitle")],
            deleteEditConf = [true, true];

        if (typeof deleteConfig === "string") {
            deleteEditTitle[0] = deleteConfig;
        }
        else if (typeof deleteConfig === "boolean" && deleteConfig === false) {
            deleteEditConf[0] = false;
        }

        if (typeof editConfig === "string") {
            deleteEditTitle[1] = editConfig;
        }
        else if (typeof editConfig === "boolean" && editConfig === false) {
            deleteEditConf[1] = false;
        }
        return [deleteEditConf, deleteEditTitle];
    },

    /**
     * Gets all layers whose configuration is incorrect
     * @param {String[]} ids - ids of the configured layers
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @return {String[]} ids of the incorrect configured layers
     */
    getIncorrectConfiguredLayerIds: function (ids) {
        const alertCases = this.get("alertCases"),
            incorrectIds = [];
        let wfsLayer,
            missingLayers,
            error;

        if (Array.isArray(ids)) {
            missingLayers = this.checkForMissingLayers(ids);
            ids.forEach(function (id) {
                if (missingLayers.indexOf(id) < 0) {
                    wfsLayer = Radio.request("ModelList", "getModelByAttributes", {id: id});
                    error = this.checkLayerConfig(wfsLayer);
                    if (error === true) {
                        if (!this.get("incorrectConfigLayers").includes(id)) {
                            incorrectIds.push(id);
                        }
                        if (!alertCases.includes("missingLayerParam")) {
                            this.setAlertCases("missingLayerParam");
                        }
                    }
                }
            }, this);
        }
        return incorrectIds;
    },

    /**
     * Checks if the layers configured for the wfst module are included in the modelList
     * They can first not be included because of e.g. secured services
     * @param {String[]} ids - ids of the configured layers
     * @return {String[]} ids of the missing layers
     */
    checkForMissingLayers: function (ids) {
        const missingLayers = [];
        let wfsLayer,
            index;

        ids.forEach(function (id) {
            wfsLayer = Radio.request("ModelList", "getModelByAttributes", {id: id});
            // if the layer is not included in the modelList
            if (wfsLayer === undefined || wfsLayer === null) {
                if (!missingLayers.includes(id)) {
                    missingLayers.push(id);
                }
            }
            // if layer is included in the modelList remove id from missingLayers Array
            else if (missingLayers.includes(id)) {
                index = missingLayers.indexOf(id);
                missingLayers.splice(index, 1);
            }
        });
        this.setMissingLayers(missingLayers);
        return missingLayers;
    },

    /**
     * Validates the configuration of the layer
     * @param {Object} wfsLayer - wfs layer
     * @return {Boolean} flag if one of the layer attributes is configured not correct
     */
    checkLayerConfig: function (wfsLayer) {
        let error = false;

        if (typeof wfsLayer === "object" && wfsLayer !== null) {
            if (typeof wfsLayer.get("url") !== "string") {
                error = true;
            }
            else if (typeof wfsLayer.get("version") !== "string") {
                error = true;
            }
            else if (typeof wfsLayer.get("featureType") !== "string") {
                error = true;
            }
            else if (typeof wfsLayer.get("featureNS") !== "string") {
                error = true;
            }
            else if (typeof wfsLayer.get("featurePrefix") !== "string") {
                error = true;
            }
            else if ((typeof wfsLayer.get("gfiAttributes") !== "object" || wfsLayer === null) && typeof wfsLayer.get("gfiAttributes") !== "string") {
                error = true;
            }
        }
        else {
            error = true;
        }
        return error;
    },

    /**
     * Handles the configured layers
     * @param {{String}} ids - Ids of the configured layers
     * @param {Array} initialAlertCases - Array with all alert cases
     * @return {String[]} layer ids
     */
    handleAvailableLayers: function (ids, initialAlertCases) {
        let layerIds = [];

        if (Array.isArray(ids) && ids.length) {
            layerIds = ids;
        }
        else if (!initialAlertCases.includes("AvailableLayers")) {
            this.addInitialAlertCases("AvailableLayers");
        }
        return layerIds;
    },

    /**
     * Updates the layer list depending on selected layers in the layer tree
     * @param {Object} event - event of updatedSelectedLayerList
     * @returns {void}
     */
    updateAvailableLayers: function (event) {
        let activeLayers = this.getActiveLayers(this.get("layerIds"));
        const firstId = this.getSelectedLayer(activeLayers),
            incorrectConfigLayers = this.get("incorrectConfigLayers"),
            initialAlertCases = this.get("initialAlertCases");

        if (typeof this.get("currentLayerId") === "string" && event !== undefined && event.find(layer => layer.id === this.get("currentLayerId")) === undefined) {
            this.setIsDeselectedLayer(true);
        }
        if (Object.entries(activeLayers).length > 0) {
            // if there are active layers remove appropriate error case
            if (initialAlertCases.includes("ActiveLayers")) {
                initialAlertCases.splice(initialAlertCases.indexOf("ActiveLayers"), 1);
            }
            if (typeof firstId === "string" || typeof activeLayers[firstId] === "string") {
                if (typeof this.getCurrentLayer() !== "object" || this.getCurrentLayer() === null) {
                    this.updateActiveLayer(firstId);
                }
                else if (this.getCurrentLayer().get("isSelected") === false) {
                    this.updateActiveLayer(firstId);
                }
            }
            activeLayers = this.checkActiveLayers(activeLayers, incorrectConfigLayers);
            this.setActiveLayers(activeLayers);
        }
        else if (!initialAlertCases.includes("ActiveLayers") && !initialAlertCases.includes("AvailableLayers") && this.get("layerIds")) {
            this.addInitialAlertCases("ActiveLayers");
        }
    },

    /**
     * Checks if one of the active layers configurations is incorrect
     * @param {Object} selectedLayers - layers that are selected in the layer tree
     * @param {String[]} incorrectConfigLayers - layers with incorrect configuration
     * @return {Object} active layers that are correct configured
     */
    checkActiveLayers: function (selectedLayers, incorrectConfigLayers) {
        const initialAlertCases = this.get("initialAlertCases");
        let activeLayers = selectedLayers;

        // tests if the configuration of the active layers is incorrect and remove the incorrect layers
        if (activeLayers !== undefined && activeLayers !== null && Object.entries(activeLayers).length > 0) {
            Object.entries(activeLayers).forEach(([key]) => {
                if (incorrectConfigLayers.length > 0 && incorrectConfigLayers.includes(key)) {
                    delete activeLayers[key];
                }
            });
            if (!initialAlertCases.includes("allLayersWithIncorrectConfig") && !initialAlertCases.includes("AvailableLayers") && Object.entries(activeLayers).length <= 0) {
                this.addInitialAlertCases("allLayersWithIncorrectConfig");
            }
        }
        else {
            activeLayers = {};
        }
        return activeLayers;
    },

    /**
     * Gets the layers from the configured layers that are selected in the layer tree
     * @param {String[]} ids - all layer ids
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @return {{String}} - All layers that are selected in the layer tree
     */
    getActiveLayers: function (ids) {
        let wfsLayer;
        const activeLayers = {};

        if (Array.isArray(ids)) {
            ids.forEach(function (id) {
                wfsLayer = Radio.request("ModelList", "getModelByAttributes", {id: id});
                if (typeof wfsLayer === "object" && wfsLayer !== null && wfsLayer.get("isSelected")) {
                    activeLayers[id] = wfsLayer.get("name");
                }
            }, this);
        }
        return activeLayers;
    },

    /**
     * Gets the first layer of the selected layers in the layer list
     * @param {Object} activeLayers - All layers that are selected in the layer tree
     * @return {String} - Id of the first layer
     */
    getSelectedLayer: function (activeLayers) {
        let firstId;

        if (typeof activeLayers === "object" && activeLayers !== null && Object.entries(activeLayers).length > 0) {
            firstId = Object.keys(activeLayers)[0];
        }
        else {
            firstId = null;
        }
        return firstId;
    },

    /**
     * Returns the layer that is currently selected
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @return {Object} wfs layer
     */
    getCurrentLayer: function () {
        let wfsLayer = Radio.request("ModelList", "getModelByAttributes", {id: this.get("currentLayerId")});

        if (!wfsLayer) {
            wfsLayer = null;
        }
        return wfsLayer;
    },

    /**
     * Gets an alert message for the passed case
     * @param {String} alert - alert case
     * @return {String} alert message
     */
    getAlertMessage: function (alert) {
        const toolName = this.get("name"),
            activeLayer = this.get("currentLayerId"),
            incorrectConfigLayers = this.get("incorrectConfigLayers"),
            layerSelect = this.get("layerSelect");
        let message = "";

        if (typeof alert === "string") {
            switch (alert) {
                case "AvailableLayers":
                    message = "Es wurden keine Layer für das " + toolName + " konfiguriert. Bitte geben Sie in der Konfiguration mindestens einen Layer an, um das " + toolName + " nutzen zu können.";
                    break;
                case "ActiveLayers":
                    message = "Es wurden alle Layer, die im " + toolName + " genutzt werden können in den Themen deselektiert. Bitte selektieren Sie mindestens einen der Layer um das " + toolName + " nutzen zu können.";
                    break;
                case "wfstFields":
                    message = "Die Eingabefelder für den aktuell ausgewählte Layer mit der ID " + activeLayer + " konnten leider nicht erstellt werden. Bitte wenden Sie sich an Ihren System Administrator.";
                    break;
                case "FailedDFT":
                    message = "Beim Laden der WFS Layer ist leider etwas schiefgelaufen. Bitte wenden Sie sich an Ihren System Administrator.";
                    break;
                case "faultyDFTResponse":
                    message = "Der WFS Layer ist leider fehlerhaft. Bitte wenden Sie sich an Ihren System Administrator.";
                    break;
                case "gfiAttrIgnore":
                    message = "Die Attribute für den aktuell ausgewählte Layer können leider nicht ausgelesen werden. Bitte wenden Sie sich an Ihren System Administrator.";
                    break;
                case "decimalError":
                    message = "Bitte geben Sie nur Dezimalzahlen ein! Das Dezimal-Trennzeichen ist ein Komma.";
                    break;
                case "integerError":
                    message = "Bitte geben Sie nur ganze Zahlen ein!";
                    break;
                case "missingLayerParam":
                    if (incorrectConfigLayers.length === 1) {
                        message = "Die Konfiguration des Layers mit der Id " + incorrectConfigLayers + " ist fehlerhaft. Der genannte Layer wurde daher nicht zur Layer Liste hinzugefügt. Bitte prüfen Sie die Konfiguration.";
                    }
                    else {
                        message = "Die Konfiguration der Layer mit den Ids " + incorrectConfigLayers + " ist fehlerhaft. Die genannten Layer wurden daher nicht zur Layer Liste hinzugefügt. Bitte prüfen Sie die Konfiguration.";
                    }
                    break;
                case "allLayersWithIncorrectConfig":
                    message = "Leider ist die Konfiguration aller Layer des " + toolName + " fehlerhaft. Daher kann das " + toolName + " nicht geöffnet werden.";
                    break;
                case "editNotActiveLayer":
                    message = "Die ausgewählte Geometrie gehört nicht zu dem im " + toolName + " aktiven <b>" + layerSelect + "</b> und kann daher nicht bearbeitet oder gelöscht werden. Bitte wählen Sie eine Geometrie des aktiven <b>" + layerSelect + "</b> aus oder aktivieren Sie einen anderen <b>" + layerSelect + "</b>.";
                    break;
                case "mandatoryFieldMissing":
                    message = "Bitte füllen Sie alle Pflichtfelder aus, bevor Sie die Geometrie speichern!";
                    break;
                case "noGeometry":
                    message = "Bitte erfassen Sie eine Geometrie bevor Sie speichern oder beenden Sie das Zeichnen der aktuellen Geometrie! Das Zeichnen einer Geometrie können Sie durch einen Doppelklick oder durch einen Klick auf den Startpunkt (bei Flächen) beenden.";
                    break;
                case "failedTransaction":
                    message = "Das Speichern/ Löschen der Geometrie und ihrer Parameter ist leider fehlgeschlagen. Bitte wenden Sie sich an Ihren System Administrator.";
                    break;
                case "SuccessfullSave":
                    message = "Das Speichern der Geometrie und ihrer Parameter war erfolgreich.";
                    break;
                case "failedSave":
                    message = "Das Speichern der Geometrie und ihrer Parameter ist leider fehlgeschlagen. Bitte wenden Sie sich an Ihren System Administrator.";
                    break;
                case "SuccessfullDiscard":
                    message = "Das Verwerfen der Änderungen war erfolgreich.";
                    break;
                case "failedDiscard":
                    message = "Das Verwerfen der Änderungen ist leider fehlgeschlagen. Bitte wenden Sie sich an Ihren System Administrator.";
                    break;
                case "SuccessfullDelete":
                    message = "Das Löschen der Geometrie und ihrer Parameter war erfolgreich.";
                    break;
                case "failedDelete":
                    message = "Das Löschen der Geometrie und ihrer Parameter ist leider fehlgeschlagen. Bitte wenden Sie sich an Ihren System Administrator.";
                    break;
                case "isOutOfRange":
                    message = "Das gezeichnete Objekt wird nicht angezeigt, da sich der Layer außerhalb des sichtbaren Bereichs befindet. Zoomen Sie in den sichtbaren Bereich des Layers, um Ihr Objekt zu sehen.";
                    break;
                case "InvalidValue":
                    message = "Das Speichern der Geometrie und ihrer Parameter ist leider fehlgeschlagen. Eine der Eingaben ist unzulässig bzw. nicht im richtigen Format.";
                    break;
                case "OperationParsingFailed":
                    message = "Das Speichern der Geometrie und ihrer Parameter ist leider fehlgeschlagen. Die Transaktion konnte vom Dienst nicht verarbeitet werden. Bitte wenden Sie sich an den System Administrator.";
                    break;
                case "OperationProcessingFailed":
                    message = "Das Speichern der Geometrie und ihrer Parameter ist leider fehlgeschlagen. Während der Aktion ist ein Fehler aufgetreten.";
                    break;
                case "OperationNotSupported":
                    message = "Das Speichern der Geometrie und ihrer Parameter ist leider fehlgeschlagen. Der Dienst unterstützt die durchgeführte Operation nicht.";
                    break;
                case "MissingParameterValue":
                    message = "Das Speichern der Geometrie und ihrer Parameter ist leider fehlgeschlagen. Einer oder mehrere der Parameter haben keine Eingabe und der Dienst verfügt über keinen Defaultwert.";
                    break;
                case "InvalidParameterValue":
                    message = "Das Speichern der Geometrie und ihrer Parameter ist leider fehlgeschlagen. Eine der Eingaben ist unzulässig bzw. nicht im richtigen Format.";
                    break;
                case "OptionNotSupported":
                    message = "Das Speichern der Geometrie und ihrer Parameter ist leider fehlgeschlagen. Der Dienst unterstützt die durchgeführte Transaktion nicht.";
                    break;
                default:
                    break;
            }
        }
        return message;
    },

    /**
     * Updates all attributes of the current active layer and handles all actions if the current active layer changes
     * @param {String} id - Id of the current active layer
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    updateActiveLayer: function (id) {
        let wfsLayer = {},
            parameter = {},
            isSecured = false;

        this.setCurrentLayerId(id);

        wfsLayer = Radio.request("ModelList", "getModelByAttributes", {id: id});
        parameter = this.getLayerParams(wfsLayer);
        isSecured = wfsLayer.attributes.isSecured !== undefined ? wfsLayer.attributes.isSecured : false;

        this.setUrl(parameter.url);
        this.setFeatureType(parameter.featureType);
        this.setVersion(parameter.version);
        this.setFeatureNS(parameter.featureNS);
        this.setFeaturePrefix(parameter.featurePrefix);
        this.setGfiAttributes(parameter.gfiAttributes);
        this.setIsSecured(isSecured);

        this.sendDescribeFeatureType(parameter.url, parameter.version, parameter.featureType, isSecured);
    },

    /**
     * Gets the attributes of the current active layer
     * @param {Object} wfsLayer - current active layer
     * @return {Object} object with all attributes of the current active layer
     */
    getLayerParams: function (wfsLayer) {
        const parameter = {};

        if (typeof wfsLayer === "object" && wfsLayer !== null && Object.entries(wfsLayer).length > 0) {
            parameter.url = wfsLayer.get("url");
            parameter.version = wfsLayer.get("version");
            parameter.featureType = wfsLayer.get("featureType");
            parameter.featureNS = wfsLayer.get("featureNS");
            parameter.featurePrefix = wfsLayer.get("featurePrefix");
            parameter.gfiAttributes = wfsLayer.get("gfiAttributes");
        }
        return parameter;
    },

    /**
     * Sends a DescribeFeatureType request depending on the current active layer in the tool
     * @param {String} url - url of the current active layer
     * @param {String} version - version of the current active layer
     * @param {String} typename - featureType name of the current active layer
     * @param {Boolean} isSecured - flag if wfs layer is secured
     * @returns {void}
     */
    sendDescribeFeatureType: function (url, version, typename, isSecured) {
        const timeout = isSecured ? 0 : 5000;

        $.ajax(url + "?SERVICE=WFS&REQUEST=DescribeFeatureType&VERSION=" + version + "&TYPENAME=" + typename, {
            method: "GET",
            context: this,
            xhrFields: {
                withCredentials: isSecured
            },
            success: this.handleResponse,
            timeout: timeout,
            error: function () {
                this.handleError();
            }
        });
    },

    /**
     * Handles the response from the DescribeFeatureType request
     * @param {Object} response - response of the DescribeFeatureType request
     * @returns {void}
     */
    handleResponse: function (response) {
        const gfiAttributes = this.get("gfiAttributes"),
            featureTypename = this.get("featureType"),
            attributeFields = this.parseResponse(response, featureTypename),
            geometryName = this.getGeometryName(attributeFields),
            // Data format of the input fields
            type = this.getTypeOfInputFields(attributeFields),
            // Mandatory fields
            mandatory = this.getMandatoryFields(attributeFields);
        let wfstFields,
            message;

        if (attributeFields.length <= 1) {
            console.error("The WFS-Layer is invalid. The layer has no attributes.");
            message = this.getAlertMessage("faultyDFTResponse");
            store.dispatch("Alerting/addSingleAlert", {
                category: "Warnung",
                displayClass: "warning",
                content: message,
                mustBeConfirmed: false
            });
        }
        else {
            this.setAttributesField(attributeFields);
            this.setGeometryName(geometryName);
            wfstFields = this.filterInputFields(gfiAttributes, attributeFields);
            wfstFields = this.handleInputFields(wfstFields, type, mandatory);
            this.setWfstFields(wfstFields);
            this.handleButtonConfig();
        }
    },

    /**
     * Handles a not successfull DescribeFeaturType request
     * @returns {void}
     */
    handleError: function () {
        this.addInitialAlertCases("FailedDFT");
    },

    /**
     * Parses the response of the DescribeFeatureType request depending on XML schema version
     * @param {Object} response - response of the DescribeFeatureType request
     * @param {String} featureTypename - name of the feature type
     * @return {Object} attributes of featureType
     */
    parseResponse: function (response, featureTypename) {
        let complexType,
            elementType,
            complexName,
            attrElement,
            elements,
            complexTypes;
        const attributeFields = [];

        if (typeof response === "object" && response !== null) {
            attrElement = $(response).find("*").filter(function () {
                return $(this).attr("name") === featureTypename;
            });
            // if there is no element with the featureTypename and the featureTypename has a prefix
            if (attrElement.length === 0 && featureTypename.indexOf(":") > 0) {
                attrElement = $(response).find("*").filter(function () {
                    return $(this).attr("name") === featureTypename.slice(featureTypename.indexOf(":") + 1);
                });
            }
            if (attrElement.length > 0) {
                complexType = $(attrElement).find("*").filter(function () {
                    return this.localName === "complexType";
                });
                // case 1: hierarchical XML Schema
                if (complexType.length === 1) {
                    elements = $(attrElement).find("*").filter(function () {
                        return this.localName === "element";
                    });
                    elements.each(function (index, e) {
                        attributeFields.push(e);
                    });
                }
                // case 2: non-hierarchical XML Schema
                else if (complexType.length === 0) {
                    elementType = $(attrElement).attr("type").trim().split(":");
                    if (elementType.length === 2) {
                        complexName = elementType[1];
                    }
                    else if (elementType.length === 1) {
                        complexName = elementType[0];
                    }
                    complexTypes = $(response).find("*").filter(function () {
                        return this.localName === "complexType";
                    });
                    complexTypes.each(function () {
                        if ($(this).attr("name") === complexName) {
                            elements = $(this).find("*").filter(function () {
                                return this.localName === "element";
                            });
                            elements.each(function (index, e) {
                                attributeFields.push(e);
                            });
                        }
                    });
                }
            }
        }
        return attributeFields;
    },

    /**
     * Sets the configurations from the gfiAttributes to the wfstFields
     * @param {Object} gfiAttributes - configurations for the input fields
     * @param {Object[]} attributeFields - feature type attributes
     * @fires Alerting#RadioTriggerAlertAlert
     * @return {Object[]} wfstFields with configurations from gfiAttributes
     */
    filterInputFields: function (gfiAttributes, attributeFields) {
        const wfstFields = [];
        let name,
            type,
            message;

        if (gfiAttributes === "showAll") {
            $(attributeFields).each(function () {
                name = $(this).attr("name");
                type = $(this).attr("type");
                if (name.toLowerCase().indexOf("id") === -1 && type.indexOf("gml") === -1) {
                    wfstFields.push({
                        "field": name,
                        "caption": name
                    });
                }
            });
        }
        else if (gfiAttributes === "ignore") {
            message = this.getAlertMessage("gfiAttrIgnore");
            store.dispatch("Alerting/addSingleAlert", {
                category: "Warnung",
                displayClass: "warning",
                content: message,
                mustBeConfirmed: false
            });
            console.warn("The gfiAttributes are configured with 'ignore' in the configuration of the currently selected layer. Therefore, no attributes of the layer are read and processed.");
        }
        else if (typeof gfiAttributes === "object" && gfiAttributes !== null) {
            Object.entries(gfiAttributes).forEach(([key, value]) => {
                wfstFields.push({
                    "field": key,
                    "caption": value
                });
            });
        }
        return wfstFields;
    },

    /**
     * Extracts the geometry name
     * @param {Object[]} attributeFields - feature type attributes
     * @return {String} name of the geometry
     */
    getGeometryName: function (attributeFields) {
        let geometryName = null;

        $(attributeFields).each(function () {
            if ($(this).attr("type").indexOf("gml:") >= 0) {
                geometryName = $(this).attr("name");
            }
        });
        return geometryName;
    },

    /**
     * Set types for attributes of featureType
     * @param {Object[]} attributeFields - feature type attributes
     * @return {Object} Object with the types of the inputFields
     */
    getTypeOfInputFields: function (attributeFields) {
        const types = {};
        let name,
            type;

        if (attributeFields !== undefined && attributeFields !== null) {
            Object.entries(attributeFields).forEach(([, value]) => {
                type = $(value).attr("type");
                name = $(value).attr("name");

                if (typeof type === "string") {
                    if (type === "string") {
                        types[name] = {
                            fieldType: "text",
                            type: type
                        };
                    }
                    if (type === "integer" || type === "int" || type === "decimal") {
                        types[name] = {
                            fieldType: "text",
                            type: type
                        };
                    }
                    if (type === "boolean") {
                        types[name] = {
                            fieldType: "checkbox",
                            type: type
                        };
                    }
                    if (type === "date") {
                        types[name] = {
                            fieldType: "date",
                            type: type
                        };
                    }
                }
            });
        }
        return types;
    },

    /**
     * Sets a flag if the attribute of the featureType is mandatory
     * if minOccurs is 1 or undefined the parameter is mandatory
     * if minOccurs is 0 the parameter is not mandatory
     * @param {Object[]} attributeFields - feature type attributes
     * @return {Boolean[]} Array with flags for mandatory fields
     */
    getMandatoryFields: function (attributeFields) {
        const mandatory = [];
        let name;

        if (typeof attributeFields === "object" && attributeFields !== null) {
            Object.entries(attributeFields).forEach(([, value]) => {
                name = $(value).attr("name");
                if ($(value).attr("minOccurs") !== undefined) {
                    if ($(value).attr("minOccurs") === "1") {
                        mandatory[name] = true;
                    }
                    else if ($(value).attr("minOccurs") === "0") {
                        mandatory[name] = false;
                    }
                }
                else if ($(value).attr("minOccurs") === undefined) {
                    mandatory[name] = true;
                }
            });
        }
        return mandatory;
    },

    /**
     * Sets attributes of the featureType to wfstFields, filtered from the DescribeFeatureType response
     * @param {Object[]} attributeFields - wfstFields filtered by gfiAttributes
     * @param {Object} type - types of attributes
     * @param {Boolean[]} mandatory - flags if attributes are mandatory
     * @return {Object[]} wfstFields with all attributes of the featureTypes
     */
    handleInputFields: function (attributeFields, type, mandatory) {
        let wfstFields = attributeFields;

        if (Array.isArray(wfstFields) && typeof type === "object" && type !== null && Array.isArray(mandatory)) {
            wfstFields.forEach(function (field) {
                if (typeof type[field.field] === "object" && type[field.field] !== null) {
                    field.type = type[field.field].type;
                    field.inputFieldType = type[field.field].fieldType;
                }
                else {
                    field.type = "string";
                    field.inputFieldType = "text";
                }
                if (typeof mandatory[field.field] === "boolean") {
                    field.mandatory = mandatory[field.field];
                }
                else {
                    field.mandatory = false;
                }
            });
        }
        else {
            wfstFields = [];
        }
        return wfstFields;
    },

    /**
     * Handles the configuration of the titles and the configuration of displaying the buttons point, line and area
     * @returns {void}
     */
    handleButtonConfig: function () {
        const attributesField = this.get("attributesField"),
            layerId = this.get("currentLayerId"),
            layerSelect = this.get("layerSelect"),
            buttons = [this.get("pointButton"), this.get("lineButton"), this.get("areaButton")],
            initialButtonTitleConfig = this.get("initialButtonTitleConfig");

        this.setButtonConfig(this.getButtonConfig(attributesField, layerId, buttons));
        this.setButtonTitleConfigs(this.getButtonTitleConfigs(layerSelect, buttons, initialButtonTitleConfig, layerId));
    },

    /**
     * Sets the configured or default captions for the point, line and area buttons and for the layer select
     * @param {String} layerSelect - Title of the layer select Object
     * @param {Object[]} buttons - Array with the configurations of the buttons point, line and area
     * @param {String[]} initialButtonTitleConfig - Array with the initial title configurations of the buttons point, line and area
     * @param {String} layerId - Id of the current active layer
     * @return {String[]} Array with all buttonTitles
     */
    getButtonTitleConfigs: function (layerSelect, buttons, initialButtonTitleConfig, layerId) {
        const buttonTitles = [];
        let layer;

        buttons.forEach(function (button, index) {
            if (typeof button === "object" && button !== null) {
                layer = button.find(object => object.layerId === layerId);

                if (typeof layer !== "object" || layer === null) {
                    buttonTitles[index] = initialButtonTitleConfig[index];
                }
                else if (typeof layer.caption === "string") {
                    buttonTitles[index] = layer.caption;
                }
                else if (typeof layer.caption !== "string") {
                    buttonTitles[index] = initialButtonTitleConfig[index];
                }
            }
            else {
                buttonTitles[index] = initialButtonTitleConfig[index];
            }
        });
        if (typeof layerSelect === "string" && layerSelect !== "") {
            buttonTitles[3] = layerSelect;
        }
        else {
            buttonTitles[3] = initialButtonTitleConfig[3];
        }
        return buttonTitles;
    },

    /**
     * Gets the configurations for displaying the point, line and area buttons
     * only if the layer does not expect a special geometry type
     * @param {Object[]} attributeFields - attributes of the feature type
     * @param {String} layerId - Id of the current active layer
     * @param {Object[]} buttons - Array with the configurations of the buttons point, line and area
     * @return {Boolean[]} - Array with flag for each button (point, line, area). Where true means that the button must be displayed.
     */
    getButtonConfig: function (attributeFields, layerId, buttons) {
        let geometry,
            layer;
        const layerGeometry = [];

        $(attributeFields).each(function () {
            if ($(this).attr("type").indexOf("gml:") >= 0) {
                geometry = $(this).attr("type").toUpperCase();
                layerGeometry[0] = geometry.indexOf("POINT") > 0;
                layerGeometry[1] = geometry.indexOf("LINE") > 0;
                layerGeometry[2] = geometry.indexOf("POLYGON") > 0;
            }
        });
        // if the layer does not expect a special geometry type, use the configurations for
        // displaying the point, line and area buttons
        if (!layerGeometry.includes(true)) {
            buttons.forEach(function (button, index) {
                if (typeof button === "boolean" && button === true) {
                    layerGeometry[index] = true;
                }
                else if (button === undefined) {
                    layerGeometry[index] = true;
                }
                else if (typeof button === "object" && button !== null) {
                    layer = button.find(o => o.layerId === layerId);

                    if (typeof layer !== "object" || layer === null) {
                        layerGeometry[index] = true;
                    }
                    else if (layer.show) {
                        layerGeometry[index] = true;
                    }
                    else if (!layer.show) {
                        layerGeometry[index] = false;
                    }
                }
            });
        }
        return layerGeometry;
    },

    /**
     * Gets the type of the currently edited input field
     * @param {String} id - id of the input field
     * @param {Object[]} wfstFields - wfst Fields
     * @return {String} type of the input field
     */
    getFieldType: function (id, wfstFields) {
        let type;

        wfstFields.forEach(function (field) {
            if (field.field === id) {
                type = field.type;
            }
        });
        return type;
    },

    /**
     * Values from the attribute table are saved in attribute "featureProperties"
     * @param {Object} featureProperties - properties of the feature
     * @param {String} id - input field name
     * @param {String} inputValue - input value
     * @returns {void}
     */
    handleFeatureAttributes: function (featureProperties, id, inputValue) {
        if ((typeof inputValue === "string" || typeof inputValue === "boolean") && typeof id === "string" && featureProperties !== undefined && featureProperties !== null) {
            Object.entries(featureProperties).forEach(([key, value]) => {
                if (id === key) {
                    featureProperties[key] = inputValue;
                }
                else {
                    featureProperties[key] = value;
                }
            });
        }
        return featureProperties;
    },

    /**
     * Gets the layer id of the current feature
     * @param {String} featureId - feature id
     * @param {Object[]} wfsLayers - array with all wfs layers
     * @return {String} id of the layer with the current feature
     */
    inheritModelListAttributes: function (featureId, wfsLayers) {
        let wfsLayerId;

        if (typeof featureId === "string") {
            wfsLayers.forEach(function (layer) {
                if (layer.get("layerSource").getFeatureById(featureId) !== null) {
                    wfsLayerId = layer.get("id");
                }
            });
        }
        return wfsLayerId;
    },

    /**
     * Identifies the type of the action that was carried out
     * @param {Object} feature - the current active feature
     * @param {String} activeButton - the current active button
     * @return {String} action type (insert, update or delete)
     */
    getActionType: function (feature, activeButton) {
        let actionType;

        if (activeButton !== undefined) {
            if (activeButton !== "wfst-module-recordButton-save") {
                actionType = "delete";
            }
            else if (typeof feature === "object" && feature !== null && Object.entries(feature).length > 0) {
                actionType = feature.id_ === undefined || feature.id_ === null ? "insert" : "update";
            }
        }
        return actionType;
    },

    /**
     * Prepares the feature for saving
     * @returns {void}
     */
    prepareSaving: function () {
        const feature = this.get("currentFeature"),
            wfstFields = this.get("wfstFields"),
            activeButton = this.get("activeButton"),
            geometryName = this.get("geometryName"),
            featureProperties = this.get("featureProperties"),
            orderedAttributes = this.getOrderedAttributes(this.get("attributesField"));
        let action,
            featureWithProperties,
            featureToSend,
            isConditionProofed;

        if (typeof feature === "object" && feature !== null) {
            featureWithProperties = this.handleFeatureProperties(featureProperties, feature, orderedAttributes);
            action = this.getActionType(featureWithProperties, activeButton);
            featureToSend = this.handleFeature(featureWithProperties, action);

            // perform transaction only if conditions are fullfilled (mandatory fields).
            isConditionProofed = this.proofConditions(featureToSend, wfstFields, geometryName);
            if (isConditionProofed) {
                action = this.getActionType(feature, activeButton);
                this.save(action, featureToSend);
            }
        }
    },

    /**
     * Performs the actions to save the current feature to the database
     * @param {String} mode - "insert", "update" or "delete"
     * @param {Object} feature - feature to save
     * @returns {void}
     */
    save: function (mode, feature) {
        const xmlString = this.transactionWFS(mode, feature);

        this.sendTransaction(xmlString);
    },

    /**
     * Deletes a geometry from the map and from the database
     * @param {Object} target - target feature to delete
     * @returns {void}
     */
    delete: function (target) {
        let xmlString;

        if (typeof target === "object" && target !== null) {
            xmlString = this.transactionWFS("delete", target);
            this.sendTransaction(xmlString);
        }
    },

    /**
     * Checks if all conditions are fullfilled for saving the feature
     * @param {Object} feature - feature to save,
     * @param {Object[]} wfstFields - wfst Fields
     * @param {String} geometryName - geometry name of the current active layer
     * @fires Alerting#RadioTriggerAlertAlert
     * @return {Boolean} Flag if the conditions for saving the feature are fullfilled
     */
    proofConditions: function (feature, wfstFields, geometryName) {
        let message,
            isConditionProofed = true;

        // Test for mandatory fields
        if ((Array.isArray(wfstFields) && wfstFields.length) && (typeof feature === "object" && feature !== null && Object.entries(feature).length > 0)) {
            wfstFields.forEach(function (field) {
                if (field.mandatory === true) {
                    if (typeof feature.get(field.field) !== "string" || feature.get(field.field === "")) {
                        isConditionProofed = false;
                        message = this.getAlertMessage("mandatoryFieldMissing");
                        store.dispatch("Alerting/addSingleAlert", {
                            category: "Warnung",
                            displayClass: "warning",
                            content: message,
                            mustBeConfirmed: false
                        });
                    }
                }
            }, this);
        }
        else {
            isConditionProofed = false;
        }

        // Test if geometry was created
        if (typeof feature === "object" && feature !== null && Object.entries(feature).length > 0 && !feature.getKeys().includes(geometryName)) {
            isConditionProofed = false;
            message = this.getAlertMessage("noGeometry");
            store.dispatch("Alerting/addSingleAlert", {
                category: "Warnung",
                displayClass: "warning",
                content: message,
                mustBeConfirmed: false
            });
        }

        return isConditionProofed;
    },

    /**
     * gets the names of the attributes in the correct order
     * @param {Object} attributeFields attributes from DescribeFeatureType response
     * @return {String[]} ordered attribute names
     */
    getOrderedAttributes: function (attributeFields) {
        const orderedAttributes = [];

        if (attributeFields !== undefined && attributeFields !== null) {
            attributeFields.forEach(function (field) {
                orderedAttributes.push(field.getAttribute("name"));
            });
        }

        return orderedAttributes;
    },

    /**
     * Adds the feature properties in the correct order
     * @param {Object} featureProperties - properties of from input fields
     * @param {Object} feature - current feature
     * @param {Object[]} orderedAttributes - ordered atrribute names of the feature
     * @return {Object} feature with correct ordered properties
     */
    handleFeatureProperties: function (featureProperties, feature, orderedAttributes) {

        if (featureProperties !== undefined && featureProperties !== null && Object.entries(feature).length > 0 && Object.entries(featureProperties).length > 0 && orderedAttributes !== undefined) {
            Object.entries(feature.getProperties()).forEach(([key]) => {
                feature.unset(key);
            });

            orderedAttributes.forEach(function (attr) {
                if (featureProperties[attr] === undefined || Object.entries(featureProperties[attr]).length <= 0 && typeof featureProperties[attr] !== "boolean") {
                    feature.set(attr, "");
                }
                else {
                    feature.set(attr, featureProperties[attr]);
                }
            });
        }
        return feature;
    },

    /**
     * Performs some validations and - as appropriate - adjustments to the feature
     * @param {Object} feature - feature of interest
     * @param {String} mode - "insert", "update" or "delete"
     * @return {Object} the adjustet feature
     */
    handleFeature: function (feature, mode) {
        const wfstFields = this.get("wfstFields"),
            checkedFeature = this.handleFlawedAttributes(feature, wfstFields),
            decimalFeature = this.handleDecimalSeperator(checkedFeature, "transaction", wfstFields),
            featureToSend = this.handleEmptyAttributes(decimalFeature, mode);

        return featureToSend;
    },

    /**
     * Handles attributes that are incorrect
     * @param {Object} feature - feature of interest
     * @param {Object[]} wfstFields - wfst fields
     * @return {Object} the corrected feature
     */
    handleFlawedAttributes: function (feature, wfstFields) {
        if (typeof feature === "object" && feature !== null && Object.entries(feature).length > 0) {
            wfstFields.forEach(function (field) {
                if (feature.get(field.field) === undefined || feature.get(field.field) === null) {
                    feature.unset(field.field);
                }
                if (field.type === "boolean" && feature.get(field.field) === undefined) {
                    feature.set(field.field, false);
                }
            });
        }
        return feature;
    },

    /**
     * Handles the representation of the decimal seperator
     * @param {Object} feature - current feature
     * @param {String} mode - "transaction" or "displaying"
     * @param {Object[]} wfstFields - wfst fields
     * @return {Object} rendered feature
     */
    handleDecimalSeperator: function (feature, mode, wfstFields) {
        let decimal;

        if (typeof feature === "object" && feature !== null && Object.entries(feature).length > 0) {
            wfstFields.forEach(function (field) {
                if (mode === "transaction") {
                    if (field.type === "decimal" && feature.get(field.field) !== undefined) {
                        decimal = feature.get(field.field).replace(",", ".");
                        feature.set(field.field, decimal);
                    }
                }
                else if (mode === "display") {
                    if (field.type === "decimal" && feature[field.field] !== undefined) {
                        feature[field.field] = feature[field.field].replace(".", ",");
                    }
                }
            });
        }
        return feature;
    },

    /**
     * Removes the empty attributes from the feature
     * @param {Object} feature - feature for transaction
     * @param {String} mode - "insert", "update" or "delete"
     * @return {Object} modyfied feature
     */
    handleEmptyAttributes: function (feature, mode) {
        if (typeof feature === "object" && feature !== null && Object.entries(feature).length > 0) {
            Object.entries(feature.getProperties()).forEach(([key]) => {
                if (typeof feature.getProperties()[key] === "string" && (feature.getProperties()[key] === "" || Object.entries(feature.getProperties()[key]).length <= 0)) {
                    if (mode === "insert") {
                        feature.unset(key);
                    }
                    else if (mode === "update") {
                        feature.set(key, null);
                    }
                }
            }, this);
        }
        return feature;
    },

    /**
     * Adds properties to a drawn feature
     * @param {Obejct} feature - feature with possible missing property
     * @param {String} geometry - feature geometry name
     * @param {Object} properties - properties of the feature
     * @param {String} mode - "drawProperties" or "draw"
     * @return {Object} adjusted feature
     */
    handleMissingFeatureProperties: function (feature, geometry, properties, mode) {
        if (typeof feature === "object" && feature !== null && Object.entries(feature).length > 0) {
            this.get("wfstFields").forEach(function (field) {
                if (!feature.getProperties().hasOwnProperty(field.field)) {
                    if (mode === "drawProperties" && typeof properties === "object" && properties !== null && Object.entries(properties > 0)) {
                        feature.set(field.field, properties[field.field]);
                    }
                    else {
                        feature.set(field.field, "");
                        if (mode === "draw") {
                            feature.set(geometry, "");
                        }
                    }
                }
            });
        }
        return feature;
    },

    /**
     * Creates the transaction xml for "insert", "delete" and "update"
     * @param {String} mode - "insert", "update" or "delete"
     * @param {Object} feature - feature of interest
     * @param {Object} opt_writeOptions - optional external write options
     * @return {String} transaction xml
     */
    transactionWFS: function (mode, feature, opt_writeOptions) {
        let domNode,
            xmlString;
        const xmlSerializer = new XMLSerializer(),
            writeOptions = opt_writeOptions || {
                featureNS: this.get("featureNS"),
                featurePrefix: this.get("featurePrefix"),
                featureType: this.get("featureType"),
                srsName: "EPSG:25832"
                // version: this.get("version")
            },
            formatWFS = new WFS();

        // As soon as ol can handle wfs 2.0.0 add a differentiation between the version numbers and write xml for wfs 2.0.0
        if (typeof feature === "object" && feature !== null && Object.entries(feature).length > 0) {
            switch (mode) {
                case "insert":
                {
                    domNode = formatWFS.writeTransaction([feature], null, null, writeOptions);
                    xmlString = xmlSerializer.serializeToString(domNode);
                    break;
                }
                case "delete":
                {
                    domNode = formatWFS.writeTransaction(null, null, [feature], writeOptions);
                    xmlString = xmlSerializer.serializeToString(domNode);
                    xmlString = this.handleIEXml(xmlString, writeOptions, mode);
                    break;
                }
                case "update":
                {
                    domNode = formatWFS.writeTransaction(null, [feature], null, writeOptions);
                    xmlString = xmlSerializer.serializeToString(domNode);
                    xmlString = xmlString.replace(/<Name>/ig, "<Name>" + writeOptions.featurePrefix + ":");
                    xmlString = this.handleIEXml(xmlString, writeOptions, mode);
                    break;
                }
                default:
                {
                    break;
                }
            }
        }
        return xmlString;
    },

    /**
     * adapt the xml String for the transaction with IE
     * @param {String} xmlString - xml string for transaction
     * @param {Object} writeOptions - Options for writing the transaction xml string
     * @param {String} mode - update" or "delete"
     * @return {String} xmlString for IE11
     */
    handleIEXml: function (xmlString, writeOptions, mode) {
        const namespace = " xmlns:" + writeOptions.featurePrefix + "=\"" + writeOptions.featureNS + "\"";
        let IExmlString = xmlString,
            tag,
            index;

        if (xmlString.indexOf(namespace) <= 0 && typeof mode === "string" && typeof writeOptions === "object" && writeOptions !== null && Object.entries(writeOptions).length > 0) {
            if (mode === "update") {
                tag = "<Update typeName=\"" + writeOptions.featurePrefix + ":" + writeOptions.featureType + "\"";
                index = xmlString.indexOf(tag);
            }
            else if (mode === "delete") {
                tag = "<Delete typeName=\"" + writeOptions.featurePrefix + ":" + writeOptions.featureType + "\"";
                index = xmlString.indexOf(tag);
            }
            IExmlString = xmlString.substring(0, index + tag.length) + namespace + xmlString.substring(index + tag.length);
        }
        return IExmlString;
    },

    /**
     * Sends the transaction
     * @param {String} xmlString - xml String
     * @fires Core#RadioTriggerUtilShowLoader
     * @fires Core#RadioTriggerUtilHideLoader
     * @returns {void}
     */
    sendTransaction: function (xmlString) {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url"),
            that = this,
            isSecured = this.get("isSecured");

        Radio.trigger("Util", "showLoader");
        if (xmlString.length > 0) {
            $.ajax({
                url: url,
                method: "POST",
                processData: false,
                contentType: "text/xml",
                xhrFields: {
                    withCredentials: isSecured
                },
                data: xmlString,
                success: function (data, textStatus, jqXHR) {
                    Radio.trigger("Util", "hideLoader");
                    that.transactionSuccess(data, textStatus, jqXHR);
                },
                error: function (jqXHR) {
                    that.transactionError(jqXHR);
                    Radio.trigger("Util", "hideLoader");
                }
            });
        }
    },

    /**
     * Handles a successfull transaction
     * @param {Object} data - response data from ajax transaction
     * @param {String} textStatus - describes the status
     * @param {Object} jqXHR - response object
     * @fires Map#RadioTriggerMapRemoveInteraction
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    transactionSuccess: function (data, textStatus, jqXHR) {
        const feature = this.get("currentFeature"),
            activeButton = this.get("activeButton");
        let message,
            actionType,
            alertCase;

        // transaction was successfull
        if (jqXHR.responseText.includes("TransactionSummary")) {
            actionType = this.getActionType(feature, activeButton);
            if (this.proofForCorrectTransact(data, actionType) === true) {
                this.setSuccessfullTransaction("success");
                Radio.trigger("Map", "removeInteraction", this.get("interaction"));
                if (this.get("activeButton") === "wfst-module-recordButton-save") {
                    alertCase = "SuccessfullSave";
                }
                else if (this.get("activeButton") === "wfst-module-recordButton-delete") {
                    alertCase = "SuccessfullDelete";
                }
                message = this.getAlertMessage(alertCase);
                store.dispatch("Alerting/addSingleAlert", {
                    category: "Info",
                    displayClass: "info",
                    content: message,
                    mustBeConfirmed: false
                });
            }
        }
        else {
            this.transactionError(jqXHR);
        }
    },

    /**
     * Handles a not successful transaction
     * @param {Object} jqXHR - response object
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    transactionError: function (jqXHR) {
        let message,
            exceptionCode,
            exceptionText,
            alertCase;
        const exceptionCodes = this.get("exceptionCodes");

        this.setSuccessfullTransaction("noSuccess");

        // if response contains an exception, give an appropriate feedback to the exception code
        if (jqXHR.responseText !== undefined && jqXHR.responseText.includes("Exception")) {
            exceptionCode = this.getSubstring(jqXHR.responseText, ["exceptionCode", "\"", "\""]);
            if (exceptionCodes.includes(exceptionCode)) {
                message = this.getAlertMessage(exceptionCode);
            }
            else {
                message = this.getAlertMessage("failedTransaction");
            }
            // Get the exception text to display it in the console, for a detailed error analysis
            if (jqXHR.responseText.indexOf("ExceptionText") > 0) {
                exceptionText = this.getExceptionText(jqXHR);
                console.error("Saving has failed. \n ExceptionCode:" + exceptionCode + "\n StatusCode: " + jqXHR.statusText + "\n error message: " + exceptionText);
            }
        }
        // If the response includes no exception give a generally valid feedback
        else {
            if (this.get("activeButton") === "wfst-module-recordButton-save") {
                alertCase = "failedSave";
            }
            else if (this.get("activeButton") === "wfst-module-recordButton-delete") {
                alertCase = "failedDelete";
            }
            message = this.getAlertMessage(alertCase);
        }
        store.dispatch("Alerting/addSingleAlert", {
            category: "Fehler",
            displayClass: "error",
            content: message,
            mustBeConfirmed: false
        });
    },

    /**
     * Proofs if the structure of the ajax response is correct
     * @param {Object} response - xml response
     * @param {String} actionType - type of action previously performed
     * @return {Boolean} flag if the structure of the ajax response is as expected
     */
    proofForCorrectTransact: function (response, actionType) {
        let isCorrect = false;

        if (typeof response === "object" && response !== null) {
            $(response).find("*").each(function () {
                switch (actionType) {
                    case "insert":
                        if (this.localName.toLowerCase() === "totalinserted") {
                            isCorrect = $(this).text() === "1";
                        }
                        break;
                    case "update":
                        if (this.localName.toLowerCase() === "totalupdated") {
                            isCorrect = $(this).text() === "1";
                        }
                        break;
                    case "delete":
                        if (this.localName.toLowerCase() === "totaldeleted") {
                            isCorrect = $(this).text() === "1";
                        }
                        break;
                    default:
                        break;
                }
            });
        }
        return isCorrect;
    },

    /**
     * Gets the text of the exception
     * @param {Object} response - response of request
     * @return {String} exception text
     */
    getExceptionText: function (response) {
        let exceptionText;

        if (typeof response === "object" && response !== null && Object.entries(response).length > 0) {
            if ($(response.responseText).find("ExceptionText").prevObject[2] !== undefined) {
                exceptionText = $(response.responseText).find("ExceptionText").prevObject[2].innerText;
            }
            else {
                exceptionText = this.getSubstring(response.responseText, ["ExceptionText", ">", "</"]);
            }
        }
        return exceptionText;
    },

    /**
     * Extracts the value of an exception Code from a string
     * @param {String} exception - exception text
     * @param {String[]} seperator - Array, indicating the beginning and end of the string
     * @return {String} the substring with the exception code.
     */
    getSubstring: function (exception, seperator) {
        let index1,
            index2,
            index3,
            string1,
            string2,
            string3;

        if (typeof exception === "string" && Array.isArray(seperator) && seperator.length) {
            index1 = exception.indexOf(seperator[0]);
            string1 = exception.substring(index1);

            index2 = string1.indexOf(seperator[1]);
            string2 = string1.substring(index2 + 1);

            index3 = string2.indexOf(seperator[2]);
            string3 = string2.substring(0, index3);
        }
        return string3;
    },

    /**
     * Adds an alert case to the initial alert cases
     * @param {String} value - the new alert case
     * @returns {void}
     */
    addInitialAlertCases: function (value) {
        this.get("initialAlertCases").push(value);
    },

    /**
     * Setter for activeButton
     * @param {String} value - activeButton
     * @returns {void}
     */
    setActiveButton: function (value) {
        this.set("activeButton", value);
    },

    /**
     * Setter for activeLayers
     * @param {Object} value - activeLayers
     * @returns {void}
     */
    setActiveLayers: function (value) {
        this.set("activeLayers", value);
    },

    /**
     * Setter for alertCases
     * @param {String[]} value - alertCases
     * @returns {void}
     */
    setAlertCases: function (value) {
        this.get("alertCases").push(value);
    },

    /**
     * Setter for attributesField
     * @param {Object[]} value - attributesField
     * @returns {void}
     */
    setAttributesField: function (value) {
        this.set("attributesField", value);
    },

    /**
     * Setter for buttonTitleConfig
     * @param {String[]} value - buttonTitleConfig
     * @returns {void}
     */
    setButtonTitleConfigs: function (value) {
        this.set("buttonTitleConfig", value);
    },

    /**
     * Setter for buttonConfig
     * @param {Boolean[]} value - buttonConfig
     * @returns {void}
     */
    setButtonConfig: function (value) {
        this.set("buttonConfig", value);
    },

    /**
     * Setter for currentFeature
     * @param {Object} value - currentFeature
     * @returns {void}
     */
    setCurrentFeature: function (value) {
        this.set("currentFeature", value);
    },

    /**
     * Setter for currentLayerId
     * @param {String} value - currentLayerId
     * @returns {void}
     */
    setCurrentLayerId: function (value) {
        this.set("currentLayerId", value);
    },

    /**
     * Setter for deleteButton
     * @param {Boolean} value - deleteButton
     * @returns {void}
     */
    setDeleteButton: function (value) {
        this.set("deleteButton", value);
    },

    /**
     * Setter for deleteButtonTitle
     * @param {String} value - deleteButtonTitle
     * @returns {void}
     */
    setDeleteButtonTitle: function (value) {
        this.set("deleteButtonTitle", value);
    },

    /**
     * Setter for isDeselectedLayer
     * @param {Boolean} value - isDeselectedLayer
     * @returns {void}
     */
    setIsDeselectedLayer: function (value) {
        this.set("isDeselectedLayer", value);
    },

    /**
     * Setter for isSecured
     * @param {Boolean} value - isSecured
     * @returns {void}
     */
    setIsSecured: function (value) {
        this.set("isSecured", value);
    },

    /**
     * Setter for editButton
     * @param {Boolean} value - editButton
     * @returns {void}
     */
    setEditButton: function (value) {
        this.set("editButton", value);
    },

    /**
     * Setter for editButtonTitle
     * @param {String} value - editButtonTitle
     * @returns {void}
     */
    setEditButtonTitle: function (value) {
        this.set("editButtonTitle", value);
    },

    /**
     * Setter for featureNS
     * @param {String} value - featureNS
     * @returns {void}
     */
    setFeatureNS: function (value) {
        this.set("featureNS", value);
    },

    /**
     * Setter for featurePrefix
     * @param {String} value - featurePrefix
     * @returns {void}
     */
    setFeaturePrefix: function (value) {
        this.set("featurePrefix", value);
    },

    /**
     * Setter for featureProperties
     * @param {Object} value - featureProperties
     * @returns {void}
     */
    setFeatureProperties: function (value) {
        this.set("featureProperties", value);
    },

    /**
     * Setter for featureType
     * @param {String} value - featureType
     * @returns {void}
     */
    setFeatureType: function (value) {
        this.set("featureType", value);
    },

    /**
     * Setter for geometryName
     * @param {String} value - geometryName
     * @returns {void}
     */
    setGeometryName: function (value) {
        this.set("geometryName", value);
    },

    /**
     * Setter for gfiAttributes
     * @param {Object} value - gfiAttributes
     * @returns {void}
     */
    setGfiAttributes: function (value) {
        this.set("gfiAttributes", value);
    },

    /**
     * Setter for incorrectConfigLayers
     * @param {String[]} value - incorrectConfigLayers
     * @returns {void}
     */
    setIncorrectConfigLayers: function (value) {
        this.set("incorrectConfigLayers", value);
    },

    /**
     * Setter for showInfoText
     * @param {Boolean} value - showInfoText
     * @returns {void}
     */
    setShowInfoText: function (value) {
        this.set("showInfoText", value);
    },

    /**
     * Setter for interaction
     * @param {Object} value - interaction
     * @returns {void}
     */
    setInteractions: function (value) {
        this.set("interaction", value);
    },

    /**
     * Setter for layerIds
     * @param {String[]} value - layerIds
     * @returns {void}
     */
    setLayerIds: function (value) {
        this.set("layerIds", value);
    },

    /**
     * Setter for missingLayers
     * @param {String[]} value - missingLayers
     * @returns {void}
     */
    setMissingLayers: function (value) {
        this.set("missingLayers", value);
    },

    /**
     * Setter for showAttrTable
     * @param {Boolean} value - showAttrTable
     * @returns {void}
     */
    setShowAttrTable: function (value) {
        this.set("showAttrTable", value);
    },

    /**
     * Setter for showCancel
     * @param {Boolean} value - showCancel
     * @returns {void}
     */
    setShowCancel: function (value) {
        this.set("showCancel", value);
    },

    /**
     * Setter for successfullTransaction
     * @param {String} value - successfullTransaction
     * @returns {void}
     */
    setSuccessfullTransaction: function (value) {
        this.set("successfullTransaction", value);
    },

    /**
     * Setter for url
     * @param {String} value - url
     * @returns {void}
     */
    setUrl: function (value) {
        this.set("url", value);
    },

    /**
     * Setter for vectorLayer
     * @param {Object} value - vectorLayer
     * @returns {void}
     */
    setVectorLayer: function (value) {
        this.set("vectorLayer", value);
    },

    /**
     * Setter for version
     * @param {String} value - version
     * @returns {void}
     */
    setVersion: function (value) {
        this.set("version", value);
    },

    /**
     * Setter for wfstFields
     * @param {Object[]} value - wfstFields
     * @returns {void}
     */
    setWfstFields: function (value) {
        this.set("wfstFields", value);
    }
});

export default WfstModel;
