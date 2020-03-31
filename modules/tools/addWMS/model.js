import Tool from "../../core/modelList/tool/model";
import {WMSCapabilities} from "ol/format.js";

const AddWMSModel = Tool.extend(/** @lends AddWMSModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        renderToWindow: true,
        glyphicon: "glyphicon-plus",
        uniqueId: 100
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

                    Radio.trigger("Alert", "alert",
                        "Die Layer des angeforderten WMS wurden dem Themenbaum unter dem Menüpunkt <strong>Externe Fachdaten</strong> hinzugefügt!"
                    );

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
        Radio.trigger("Alert", "alert", "Der angegebene Dienst konnte nicht geladen werden."
        + " Bitte stellen Sie sicher, dass die URL richtig angegben wurde."
        + "<br><br> Falls das Problem weiterhin auftritt,"
        + " wenden Sie sich bitte an den Betreiber des Dienstes mit folgendem Hinweis:"
        + "<br><strong>Es soll sichergestellt werden, dass ein CORS-Header für den Dienst gesetzt ist."
        + " Dies wird von der <a target='_blank' href="
        + "'https://www.gdi-de.org/SharedDocs/Downloads/DE/GDI-DE/Dokumente/Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf?__blob=publicationFile'"
        + ">GDI-DE</a> im Kapitel 4.7.1 empfohlen</strong");
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

        this.setUniqueId(this.get("uniqueId") + 1);
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
