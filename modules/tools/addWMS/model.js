import Tool from "../../core/modelList/tool/model";
import {WMSCapabilities} from "ol/format.js";
import {intersects} from "ol/extent";
import {transform as transformCoord, getProjection} from "masterportalAPI/src/crs";

const AddWMSModel = Tool.extend(/** @lends AddWMSModel.prototype */{
    /**
     * @class AddWMSModel
     * @description After importing and parsing the external wms layers to insert the layer into menu
     * @extends Tool
     * @memberof Tools.AddWMS
     * @constructs
     * @fires Core#RadioTriggerUtilShowLoader
     * @fires Core#RadioTriggerUtilHideLoader
     * @fires Core.ModelList#RadioTriggerModelListRenderTree
     * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
     * @fires Core.ConfigLoader#RadioTriggerParserAddLayer
     */

    defaults: Object.assign({}, Tool.prototype.defaults, {
        renderToWindow: true,
        glyphicon: "glyphicon-plus",
        uniqueId: 100,
        placeholder: "",
        textExample: "",
        textLoadLayer: ""
    }),

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
     * Displaying the error
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
     * Loading and adding the external wms layers
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
        else if (url.includes("http:")) {
            Radio.trigger("Alert", "alert", i18next.t("common:modules.tools.addWMS.errorHttpsMessage"));
            return;
        }
        Radio.trigger("Util", "showLoader");
        $.ajax({
            timeout: 4000,
            context: this,
            url: url + "?request=GetCapabilities&service=WMS",
            success: function (data) {
                Radio.trigger("Util", "hideLoader");
                try {
                    const parser = new WMSCapabilities(),
                        uniqId = this.getAddWmsUniqueId(),
                        capability = parser.read(data),
                        version = capability?.version,
                        checkVersion = this.isVersionEnabled(version),
                        currentExtent = Radio.request("Parser", "getPortalConfig")?.mapView?.extent,
                        checkExtent = this.getIfInExtent(capability, currentExtent);

                    if (!checkExtent) {
                        Radio.trigger("Alert", "alert", i18next.t("common:modules.tools.addWMS.ifInExtent"));
                        return;
                    }

                    if (!checkVersion) {
                        Radio.trigger("Alert", "alert", i18next.t("common:modules.tools.addWMS.checkVersion"));
                        return;
                    }

                    this.setWMSVersion(version);
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
                    Radio.trigger("ModelList", "closeAllExpandedFolder");

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
     * Appending folders and layers to the menu based on the given layer object
     * @info recursive function
     * @param {Object} object the ol layer to hang into the menu as new folder or new layer
     * @param {String} parentId the id of the parent object in the menu
     * @param {Number} level the depth of the recursion
     * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
     * @fires Core.ConfigLoader#RadioTriggerParserAddLayer
     * @return {void}
     */
    parseLayer: function (object, parentId, level) {
        if (object.hasOwnProperty("Layer")) {
            object.Layer.forEach(layer => {
                this.parseLayer(layer, this.getParsedTitle(object.Title), level + 1);
            });
            Radio.trigger("Parser", "addFolder", object.Title, this.getParsedTitle(object.Title), parentId, level, false, false, object.invertLayerOrder);
        }
        else {
            Radio.trigger("Parser", "addLayer", object.Title, this.getParsedTitle(object.Title), parentId, level, object.Name, this.get("wmsUrl"), this.get("version"));
        }
    },

    /**
     * Getter if the version is enabled and above 1.3.0
     * @param {String} version the version of current external wms layer
     * @returns {Boolean} true or false
     */
    isVersionEnabled: function (version) {
        if (typeof version !== "string") {
            return false;
        }

        const parsedVersion = version.split(".");

        if (parseInt(parsedVersion[0], 10) < 1) {
            return false;
        }
        else if (parsedVersion.length >= 2 && parseInt(parsedVersion[0], 10) === 1 && parseInt(parsedVersion[1], 10) < 3) {
            return false;
        }

        return true;
    },

    /**
     * Getter if the imported wms layer in the extent of current map
     * @param {Object} capability the response of the imported wms layer in parsed format
     * @param {Number[]} currentExtent the extent of current map view
     * @returns {Boolean} true or false
     */
    getIfInExtent: function (capability, currentExtent) {
        const layer = capability?.Capability?.Layer?.BoundingBox?.filter(bbox => {
            return bbox?.crs && bbox?.crs.includes("EPSG") && getProjection(bbox?.crs) !== undefined && Array.isArray(bbox?.extent) && bbox?.extent.length === 4;
        });
        let layerExtent;

        // If there is no extent defined or the extent is not right defined, it will import the external wms layer(s).
        if (!Array.isArray(currentExtent) || currentExtent.length !== 4) {
            return true;
        }

        if (Array.isArray(layer) && layer.length) {
            const firstLayerExtent = transformCoord(layer[0].crs, "EPSG:25832", [layer[0].extent[0], layer[0].extent[1]]),
                secondLayerExtent = transformCoord(layer[0].crs, "EPSG:25832", [layer[0].extent[2], layer[0].extent[3]]);

            layerExtent = [firstLayerExtent[0], firstLayerExtent[1], secondLayerExtent[0], secondLayerExtent[1]];

            return intersects(currentExtent, layerExtent);
        }

        return true;
    },

    /**
     * Getter for addWMS UniqueId.
     * Counts the uniqueId 1 up.
     * @returns {String} uniqueId - The unique id for addWMS.
     */
    getAddWmsUniqueId: function () {
        const uniqueId = this.get("uniqueId");

        this.setUniqueId(uniqueId + 1);
        return "external_" + uniqueId;
    },

    /**
     * Getter for parsed title without space and slash
     * It will be used as id later in template
     * @param {String} title - the title of current layer
     * @returns {String} parsedTitle - The parsed title
     */
    getParsedTitle: function (title) {
        const finalTitle = String(title).replace(/\s+/g, "-").replace(/\//g, "-");

        return finalTitle;
    },

    /**
     * Set uniqueId
     * @param {Number} value - counter for uniqueId
     * @returns {void}
     */
    setUniqueId: function (value) {
        this.set("uniqueId", value);
    },

    /**
     * Setter for version property
     * @param {String} value the version
     * @return {void}
     */
    setWMSVersion: function (value) {
        this.set("version", value);
    },

    /**
     * Setter for wmsUrl property
     * @param {String} value the url
     * @return {void}
     */
    setWMSUrl: function (value) {
        this.set("wmsUrl", value);
    }

});

export default AddWMSModel;
