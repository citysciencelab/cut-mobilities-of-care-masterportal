import Tool from "../../core/modelList/tool/model";
import {WMSCapabilities} from "ol/format.js";

const AddWMSModel = Tool.extend(/** @lends AddWMSModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        renderToWindow: true,
        glyphicon: "glyphicon-plus"
    }),

    /**
     * @class AddWMSModel
     * @description Todo
     * @extends Tool
     * @memberof Tools
     * @constructs
     * @fires Util#RadioTriggerUtilShowLoader
     * @fires Util#RadioTriggerUtilHideLoader
     * @fires Util#RadioTriggerUtilGetProxyUrl
     * @fires ModelList#RadioTriggerModelListRenderTree
     * @fires Parser#RadioTriggerParserAddFolder
     * @fires Parser#RadioTriggerParserAddLayer
     */
    initialize: function () {
        this.superInitialize();
    },

    /**
     * todo
     * @param {string} text The error Message
     * @return {void}
     */
    displayError: function (text) {
        if (text === "" || typeof text === "undefined") {
            $(".addWMS.win-body").prepend("<div class=\"addwms_error\">Leider konnte unter der angegebenen URL kein (gültiger) WMS gefunden werden!</div>");
        }
        $(".addWMS.win-body").prepend("<div class=\"addwms_error\">" + text + "</div>");
    },

    /**
     * todo
     * @fires Util#RadioTriggerUtilShowLoader
     * @fires Util#RadioTriggerUtilHideLoader
     * @fires Util#RadioTriggerUtilGetProxyUrl
     * @fires ModelList#RadioTriggerModelListRenderTree
     * @fires Parser#RadioTriggerParserAddFolder
     * @return {void}
     */
    loadAndAddLayers: function () {
        var url = $("#wmsUrl").val();

        $(".addwms_error").remove();
        if (url === "") {
            this.displayError("Bitte die URL eines WMS in das Textfeld eingeben!");
            return;
        }
        Radio.trigger("Util", "showLoader");
        $.ajax({
            timeout: 4000,
            context: this,
            url: Radio.request("Util", "getProxyURL", url) + "?request=GetCapabilities&service=WMS",
            success: function (data) {
                var parser,
                    uniqId,
                    capability;

                Radio.trigger("Util", "hideLoader");
                try {
                    parser = new WMSCapabilities();
                    uniqId = _.uniqueId("external_");
                    capability = parser.read(data);

                    this.setWMSVersion(capability.version);
                    this.setWMSUrl(url);

                    if (_.isUndefined(Radio.request("Parser", "getItemByAttributes", {id: "ExternalLayer"}))) {
                        Radio.trigger("Parser", "addFolder", "Externe Fachdaten", "ExternalLayer", "tree", 0);
                        Radio.trigger("ModelList", "renderTree");
                        $("#Overlayer").parent().after($("#ExternalLayer").parent());
                    }
                    Radio.trigger("Parser", "addFolder", capability.Service.Title, uniqId, "ExternalLayer", 0);
                    _.each(capability.Capability.Layer.Layer, function (layer) {
                        this.parseLayer(layer, uniqId, 1);
                    }, this);
                }
                catch (e) {
                    this.displayError();
                }
            },
            error: function () {
                Radio.trigger("Util", "hideLoader");
                this.displayError();
            }
        });

    },

    /**
     * todo
     * @param {object} object todo
     * @param {string} parentId todo
     * @param {int} level todo
     * @fires Parser#RadioTriggerParserAddFolder
     * @fires Parser#RadioTriggerParserAddLayer
     * @return {void}
     */
    parseLayer: function (object, parentId, level) {
        if (_.has(object, "Layer")) {
            _.each(object.Layer, function (layer) {
                this.parseLayer(layer, object.Title, level + 1);
            }, this);
            Radio.trigger("Parser", "addFolder", object.Title, object.Title, parentId, level);
        }
        else {
            Radio.trigger("Parser", "addLayer", object.Title, object.Title, parentId, level, object.Name, this.get("wmsUrl"), this.get("version"));
        }
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
