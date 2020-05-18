import Tool from "../../core/modelList/tool/model";
import {WMSCapabilities} from "ol/format.js";

const AddWMSModel = Tool.extend(/** @lends AddWMSModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        renderToWindow: true,
        glyphicon: "glyphicon-plus",
        uniqueId: 100,
        placeholder: "",
        textExample: "",
        textLoadLayer: ""
    }),

    /**
     * @class AddWMSModel
     * @description Todo
     * @extends Tool
     * @memberof Tools.AddWMS
     * @constructs
     * @fires Core#RadioTriggerUtilShowLoader
     * @fires Core#RadioTriggerUtilHideLoader
     * @fires Core.ModelList#RadioTriggerModelListRenderTree
     * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
     * @fires Core.ConfigLoader#RadioTriggerParserAddLayer
     */
    initialize: function () {
        this.superInitialize();

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        this.set({
            placeholder: i18next.t("common:modules.tools.addWMS.placeholder"),
            textExample: i18next.t("common:modules.tools.addWMS.textExample"),
            textLoadLayer: i18next.t("common:modules.tools.addWMS.textLoadLayer")
        });
        this.set("currentLng", lng);
    },

    /**
     * todo
     * @param {string} text The error Message
     * @return {void}
     */
    displayError: function (text) {
        if (text === "" || typeof text === "undefined") {
            $(".addWMS.win-body").prepend("<div class=\"addwms_error\">" + i18next.t("common:modules.tools.addWMS.error") + "</div>");
        }
        $(".addWMS.win-body").prepend("<div class=\"addwms_error\">" + text + "</div>");
    },

    /**
     * todo
     * @fires Core#RadioTriggerUtilShowLoader
     * @fires Core#RadioTriggerUtilHideLoader
     * @fires Core.ModelList#RadioTriggerModelListRenderTree
     * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
     * @return {void}
     */
    loadAndAddLayers: function () {
        const url = $("#wmsUrl").val();

        $(".addwms_error").remove();
        if (url === "") {
            this.displayError("Bitte die URL eines WMS in das Textfeld eingeben!");
            return;
        }
        Radio.trigger("Util", "showLoader");
        $.ajax({
            timeout: 4000,
            context: this,
            url: url + "?request=GetCapabilities&service=WMS",
            success: function (data) {
                let parser,
                    uniqId,
                    capability;

                Radio.trigger("Util", "hideLoader");
                try {
                    parser = new WMSCapabilities();
                    uniqId = this.getAddWmsUniqueId();
                    capability = parser.read(data);

                    this.setWMSVersion(capability.version);
                    this.setWMSUrl(url);

                    if (Radio.request("Parser", "getItemByAttributes", {id: "ExternalLayer"}) === undefined) {
                        Radio.trigger("Parser", "addFolder", "Externe Fachdaten", "ExternalLayer", "tree", 0);
                        Radio.trigger("ModelList", "renderTree");
                        $("#Overlayer").parent().after($("#ExternalLayer").parent());
                    }
                    Radio.trigger("Parser", "addFolder", capability.Service.Title, uniqId, "ExternalLayer", 0);
                    capability.Capability.Layer.Layer.forEach(layer => {
                        this.parseLayer(layer, uniqId, 1);
                    });

                    Radio.trigger("Alert", "alert", i18next.t("common:modules.tools.addWMS.completeMessage"));

                }
                catch (e) {
                    this.displayErrorMessage();
                }
            },
            error: function () {
                Radio.trigger("Util", "hideLoader");
                this.displayErrorMessage();
            }
        });

    },

    /**
     * Display error message for wms which have misspelling or no CORS-Header.
     * @returns {void}
     */
    displayErrorMessage: function () {
        Radio.trigger("Alert", "alert", i18next.t("common:modules.tools.addWMS.errorMessage"));
    },

    /**
     * todo
     * @param {object} object todo
     * @param {string} parentId todo
     * @param {number} level todo
     * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
     * @fires Core.ConfigLoader#RadioTriggerParserAddLayer
     * @return {void}
     */
    parseLayer: function (object, parentId, level) {
        if (object.hasOwnProperty("Layer")) {
            object.Layer.forEach(layer => {
                this.parseLayer(layer, object.Title, level + 1);
            });
            Radio.trigger("Parser", "addFolder", object.Title, object.Title, parentId, level);
        }
        else {
            Radio.trigger("Parser", "addLayer", object.Title, object.Title, parentId, level, object.Name, this.get("wmsUrl"), this.get("version"));
        }
    },

    /**
     * Getter for addWMS UniqueId.
     * Counts the uniqueId 1 up.
     * @returns {string} uniqueId - The unique id for addWMS.
     */
    getAddWmsUniqueId: function () {
        const uniqueId = this.get("uniqueId");

        this.setUniqueId(uniqueId + 1);
        return "external_" + uniqueId;
    },

    /**
     * Set uniqueId
     * @param {number} value - counter for uniqueId
     * @returns {void}
     */
    setUniqueId: function (value) {
        this.set("uniqueId", value);
    },

    /**
     * Setter for version property
     * @param {string} value todo
     * @return {void}
     */
    setWMSVersion: function (value) {
        this.set("version", value);
    },

    /**
     * todo
     * Setter for wmsUrl property
     * @param {string} value todo
     * @return {void}
     */
    setWMSUrl: function (value) {
        this.set("wmsUrl", value);
    }

});

export default AddWMSModel;
