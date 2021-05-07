import DefaultTreeParser from "./parserDefaultTree";
import CustomTreeParser from "./parserCustomTree";
import store from "../../../src/app-store";

const Preparser = Backbone.Model.extend(/** @lends Preparser.prototype */{
    defaults: {
        defaultConfigPath: "config.json",
        keysNotToTranslateName: ["hitMap"]
    },
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
        const defaultConfigPath = this.get("defaultConfigPath");

        this.url = this.getUrlPath(options.url, this.requestConfigFromUtil(), defaultConfigPath);
        this.fetchData();
    },

    /**
     * Fetches the Data from the config.json.
     * @returns {void}
     */
    fetchData: function () {
        this.fetch({async: false,
            error: (model, xhr, error) => {
                Radio.trigger("Alert", "alert", {text: "Die gewünschte Konfigurationsdatei konnte unter folgendem Pfad nicht geladen werden:<br>" + this.url});

                if (error.textStatus === "parsererror") {
                    // reload page once
                    if (window.localStorage) {
                        if (!localStorage.getItem("firstLoad")) {
                            localStorage.firstLoad = true;
                            window.location.reload();
                        }
                        else {
                            localStorage.removeItem("firstLoad");
                        }
                    }
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
    * Build url to config file. Decide between absolute or relative path.
    * @param {string} [configJsonPathFromConfig=""] - url for the config.json configured in config.js
    * @param {string} [configJsonPathFromUrl=""] - The config parameter from the url, which parsed in util.
    * @param {string} [defaultConfigPath="config.json"] The default path to config.json
    * @return {string} url to config file
    */
    getUrlPath: function (configJsonPathFromConfig = "", configJsonPathFromUrl = "", defaultConfigPath = "config.json") {
        const defaultFormat = ".json";
        let targetPath = defaultConfigPath;

        if (configJsonPathFromConfig.slice(-5) !== defaultFormat && configJsonPathFromUrl.slice(-5) === defaultFormat && configJsonPathFromUrl.slice(0, 4) !== "http") {
            targetPath = configJsonPathFromConfig + configJsonPathFromUrl;
        }
        else if (configJsonPathFromUrl.slice(-5) === defaultFormat) {
            targetPath = configJsonPathFromUrl;
        }
        else if (configJsonPathFromConfig.slice(-5) === defaultFormat) {
            targetPath = configJsonPathFromConfig;
        }

        return targetPath;
    },

    /**
    * Parses the specifications from the config.json.
    * If the portalconfigparameters are parsed, this will trigger the Preparser.
    * @param {Object} response - Parameters from the config.json.
    * @returns {void} - no value is returned.
    */
    parse: function (response) {
        let attributes;

        this.addTranslationToRawConfig(response, "translate#");

        store.commit("setConfigJson", response);

        attributes = {
            portalConfig: response.Portalconfig,
            baselayer: response.Themenconfig.Hintergrundkarten,
            overlayer: response.Themenconfig.Fachdaten,
            overlayer_3d: response.Themenconfig.Fachdaten_3D,
            treeType: response.Portalconfig.hasOwnProperty("treeType") ? response.Portalconfig.treeType : "light",
            isFolderSelectable: this.parseIsFolderSelectable(Config?.tree?.isFolderSelectable),
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
     * recursive function (!) - adds a translation function named i18nextTranslate := function(setter) to each element in subconf found to be translated
     * @param {Object} subconf the raw response of the config.json - this is the raw data from the file before any changes are made; for recursion: this is the subobject of any object in the config.json
     * @param {String} prefix the prefix of values to use to recognize them for translation
     * @returns {void}
     * @pre the subconf (raw data) is as it is
     * @post all objects of translatable values of subconf (the raw data) have an extended key i18nextTranlate with a function(setter, key) added
     */
    addTranslationToRawConfig: function (subconf, prefix) {
        Object.keys(subconf).forEach(function (subkey) {
            const subobj = subconf[subkey];
            let translationKey;

            if (typeof subobj === "string") {
                if (subobj.indexOf(prefix) !== 0) {
                    if (subkey === "name") {
                        // use name defined in config.json and do not use defaultName (defined in model with key "nameTranslationKey")
                        subconf.useConfigName = true;
                    }
                    // no translation wanted
                    return;
                }

                translationKey = subobj.substr(prefix.length);

                // each entry should get a translation function: in the translationfile might be stuff that is not keyed in the config.json (like pure ids from the Dienstemanager)
                // at this point pure arrays in the config.json can't be translated with a translation function
                if (!Array.isArray(subconf) && !subconf.hasOwnProperty("i18nextTranslate")) {
                    /**
                     * callback function i18nextTranslate
                     * @param {Function} setter a function(translation) to set the value of key
                     * @param {String} key the key (of subconf) which value should be translated
                     * @returns {void}
                     * @pre the value of key is as it is
                     * @post the value of key is run and replaced through i18next.t if key exists for i18next to translate
                     */
                    subconf.i18nextTranslate = function (setter) {
                        if (typeof setter === "function" && i18next.exists(translationKey)) {
                            setter(subkey, i18next.t(translationKey));
                        }
                        // handle language-files from addons
                        else if (typeof setter === "function" && translationKey.indexOf("additional") === 0) {
                            setter(subkey, i18next.t(translationKey));
                        }
                    };
                }
                else if (subconf.hasOwnProperty("i18nextTranslate") && typeof subconf.i18nextTranslate === "function") {
                    // a function already exists - this means more then one value of this object in the config.json must be translated
                    // put former i18nextTranslate function into scope
                    const cascadeFunction = subconf.i18nextTranslate;

                    /**
                     * callback function i18nextTranslate with cascading former function (cascadeFunction)
                     * @param {Function} setter a function(translation) to set the value of key
                     * @param {String} key the key (of subconf) which value should be translated
                     * @returns {void}
                     * @pre the values of all keys are as they are
                     * @post the translation functions for all keys where run in a cascade
                     */
                    subconf.i18nextTranslate = function (setter) {
                        // translate former values
                        cascadeFunction(setter);

                        // translate actual value
                        if (typeof setter === "function" && i18next.exists(translationKey)) {
                            setter(subkey, i18next.t(translationKey));
                        }
                        // handle language-files from addons
                        else if (typeof setter === "function" && translationKey.indexOf("additional") === 0) {
                            setter(subkey, i18next.t(translationKey));
                        }
                    };
                }

                // run the translation once for startup to ensure the absence of any translation key found in the config.json
                // after this - use i18nextTranslate on any object to translate the value
                if (i18next.exists(translationKey)) {
                    subconf[subkey] = i18next.t(translationKey);
                }
            }
            else if (typeof subobj === "object" && this.get("keysNotToTranslateName").indexOf(subkey) < 0) {
                this.addTranslationToRawConfig(subobj, prefix);
            }
        }, this);
    },


    /**

    /**
     * Update the preparsed treeType from attributes to be downward compatible.
     * @param {Object} attributes Preparased portalconfig attributes.
     * @param {Object} response  Config from config.json.
     * @returns {Object} - Attributes with mapped treeType
     * @deprecated in 3.0.0. Remove whole function and call!
     */
    updateTreeType: function (attributes, response) {
        if (response.Portalconfig.hasOwnProperty("treeType")) {
            attributes.treeType = response.Portalconfig.treeType;
        }
        else if (response.Portalconfig.hasOwnProperty("Baumtyp")) {
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
        const container = $("div.lgv-container");

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
        let infos,
            url;

        if (Config.hasOwnProperty("infoJson")) {
            url = Config.infoJson;
        }

        if (url !== undefined) {
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
