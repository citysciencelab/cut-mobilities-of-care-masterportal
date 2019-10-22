import DefaultTreeParser from "./parserDefaultTree";
import CustomTreeParser from "./parserCustomTree";

const Preparser = Backbone.Model.extend(/** @lends Preparser.prototype */{
    defaults: {},
    /**
     * @class Preparser
     * @extends Backbone.Model
     * @memberof Core.ConfigLoader
     * @constructs
     * @fires Core#RadioRequestUtilGetConfig
     * @fires Alerting#RadioTriggerAlertAlert
     * @description Loading and preperation for parsing (calls parser for default or custom tree) of the configuration file (config.json).
     * @param {*} attributes todo
     * @param {*} options todo
     */
    initialize: function (attributes, options) {
        this.url = this.getUrlPath(options.url);
        this.fetch({async: false,
            error: function (model, xhr, error) {
                const statusText = xhr.statusText;
                let message,
                    position,
                    snippet;

                // SyntaxError for consoletesting, propably because of older version.
                if (statusText === "Not Found" || statusText.indexOf("SyntaxError") !== -1) {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Die Datei '" + model.url + "' ist nicht vorhanden!</strong>",
                        kategorie: "alert-warning"
                    });
                }
                else {
                    message = error.errorThrown.message;
                    position = parseInt(message.substring(message.lastIndexOf(" ")), 10);
                    snippet = xhr.responseText.substring(position - 30, position + 30);
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Die Datei '" + model.url + "' konnte leider nicht geladen werden!</strong> <br> " +
                        "<small>Details: " + error.textStatus + " - " + error.errorThrown.message + ".</small><br>" +
                        "<small>Auszug:" + snippet + "</small>",
                        kategorie: "alert-warning"
                    });
                }
            }
        });
    },

    /**
    * Request config path from util.
    * This seperate helper method enables unit tests of the getUrlPath-method.
    * @fires Util#RadioRequestGetConfig
    * @return {string} relative path or absolute url to config file
    */
    requestConfigFromUtil: function () {
        return Radio.request("Util", "getConfig");
    },

    /**
    * build url to config file. decide between absolute or relative path
    * @param {string} url - base url for config
    * @return {string} url to config file
    */
    getUrlPath: function (url) {
        var path = url !== undefined ? url : "config.json",
            configPath;

        if (path.slice(-6) === "?noext") {
            path = url;
        }
        else if (path.slice(-5) !== ".json") {
            configPath = this.requestConfigFromUtil();

            if (configPath && configPath.length > 0) {

                if (configPath.match(/^https?:\/\//)) {
                    // the provided path is an absolute path
                    path = configPath;

                }
                else {
                    // the provided path is a relative path
                    // remove trailing "/" from path and leading "/" from urlparam "config". unions string using "/"
                    if (path.slice(-1) === "/") {
                        path = path.slice(0, -1);
                    }
                    if (configPath.slice(0, 1) === "/") {
                        configPath = configPath.slice(1);
                    }
                    path = path + "/" + configPath;
                }
            }
            else {
                path = "config.json";
            }
        }

        return path;
    },

    /**
    * todo
    * @param {*} response todo
    * @returns {*} todo
    */
    parse: function (response) {
        var attributes = {
            portalConfig: response.Portalconfig,
            baselayer: response.Themenconfig.Hintergrundkarten,
            overlayer: response.Themenconfig.Fachdaten,
            overlayer_3d: response.Themenconfig.Fachdaten_3D,
            treeType: _.has(response.Portalconfig, "treeType") ? response.Portalconfig.treeType : "light",
            isFolderSelectable: this.parseIsFolderSelectable(_.property(["tree", "isFolderSelectable"])(Config)),
            snippetInfos: this.requestSnippetInfos()
        };

        /**
         * this.updateTreeType
         * @deprecated in 3.0.0
         */
        attributes = this.updateTreeType(attributes, response);

        if (attributes.treeType === "default") {
            new DefaultTreeParser(attributes);
        }
        else {
            new CustomTreeParser(attributes);
        }

        /**
         * changeLgvContainer
         * @deprecated in 3.0.0
         */
        this.changeLgvContainer();
    },

    /**
     * Update the preparsed treeType from attributes to be downward compatible.
     * @param {Object} attributes Preparased portalconfig attributes.
     * @param {Object} response  Config from config.json.
     * @returns {Object} - Attributes with mapped treeType
     * @deprecated in 3.0.0. Remove whole function and call!
     */
    updateTreeType: function (attributes, response) {
        if (_.has(response.Portalconfig, "treeType")) {
            attributes.treeType = response.Portalconfig.treeType;
        }
        else if (_.has(response.Portalconfig, "Baumtyp")) {
            attributes.treeType = response.Portalconfig.Baumtyp;
            console.warn("Attribute 'Baumtyp' is deprecated. Please use 'treeType' instead.");
        }
        else {
            attributes.treeType = "light";
        }
        return attributes;
    },

    /**
     * Changing the lgv-container to masterportal-container
     * @returns {void} - no returned value
     * @deprecated in 3.0.0. Remove whole function and call!
     */
    changeLgvContainer: function () {
        var container = $("div.lgv-container");

        if (container.length) {
            container.removeClass("lgv-container").addClass("masterportal-container");
            console.warn("Div container 'lgv-container' is deprecated. Please use 'masterportal-container' instead.");
        }
        return false;
    },
    /**
    * todo
    * @param {*} globalFlag todo
    * @returns {*} todo
    */
    parseIsFolderSelectable: function (globalFlag) {
        if (globalFlag === false) {
            return false;
        }
        return true;
    },

    /**
    * todo
    * @returns {*} todo
    */
    requestSnippetInfos: function () {
        var infos,
            url;

        if (_.has(Config, "infoJson")) {
            url = Config.infoJson;
        }

        if (!_.isUndefined(url)) {
            $.ajax({
                url: url,
                async: false,
                success: function (data) {
                    infos = data;
                }
            });
        }
        return infos;
    }
});

export default Preparser;
