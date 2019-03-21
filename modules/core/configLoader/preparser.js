import DefaultTreeParser from "./parserDefaultTree";
import CustomTreeParser from "./parserCustomTree";

const Preparser = Backbone.Model.extend({
    defaults: {},

    /**
     * @class Preparser
     * @extends Backbone.Model
     * @memberof Core
     * @constructs
     * @fires Util#getConfig
     * @description Loading and preperation for parsing (calls parser for default or custom tree) of the configuration file (config.json).
     * @param {*} attributes todo
     * @param {*} options todo
     */
    initialize: function (attributes, options) {
        this.url = this.getUrlPath(options.url);
        this.fetch({async: false,
            error: function () {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Das Portal konnte leider nicht geladen werden!</strong> <br> " +
                        "<small>Details: Das Portal kann \"config.json\" unter dem angegebenen Pfad nicht finden.</small>",
                    kategorie: "alert-warning"
                });
            }
        });
    },

    /**
    * Request config path from util.
    * This seperate helper method enables unit tests of the getUrlPath-method.
    * @fires Util#getConfig
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
            treeType: response.Portalconfig.Baumtyp,
            isFolderSelectable: this.parseIsFolderSelectable(_.property(["tree", "isFolderSelectable"])(Config)),
            snippetInfos: this.requestSnippetInfos()
        };

        if (attributes.treeType === "default") {
            new DefaultTreeParser(attributes);
        }
        else {
            new CustomTreeParser(attributes);
        }
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
