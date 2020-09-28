import WMSGetFeatureInfo from "ol/format/WMSGetFeatureInfo.js";
import * as moment from "moment";

const Theme = Backbone.Model.extend(/** @lends ThemeModel.prototype */{
    /**
     * @class ThemeModel
     * @extends Tools.GFI
     * @memberof Tools.GFI.Themes
     * @constructs
     * @property {Boolean} isVisible=false the theme is visible
     * @property {String} name=undefined Layer name = Theme Title
     * @property {Boolean} isReady= Theme has queried and edited GFI attributes
     * @property {*} infoFormat=undefined Info Format for WMS-GFI
     * @property {*} gfiContent=undefined GFI-Attributs
     * @property {String} uiStyle="default" uiStyle Setting
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioRequestUtilGetProxyURL
     * @fires Core#RadioRequestUtilGetIgnoredKeys
     * @fires Core#RadioRequestUtilGetUiStyle
     */
    defaults: {
        isVisible: false,
        name: undefined,
        isReady: false,
        infoFormat: undefined,
        gfiContent: undefined,
        uiStyle: "default"
    },

    /**
     * Requestor for feature informations on all layer types
     * @returns {void}
     */
    requestFeatureInfos: function () {
        if (this.get("typ") === "WMS" || this.get("typ") === "GROUP") {
            if (this.get("infoFormat") === "text/html") {
                // Für das Bohrdatenportal werden die GFI-Anfragen in einem neuen Fenster geöffnet, gefiltert nach der ID aus dem DM.
                if (this.get("id") === "2407" || this.get("id") === "4423") {
                    this.getWmsHtmlGfi(this.parseWmsBohrdatenGfi);
                }
                else {
                    this.getWmsHtmlGfi(this.parseWmsHtmlGfi);
                }
            }
            else {
                this.getWmsGfi(this.parseWmsGfi);
            }
        }
        else if (this.get("typ") === "Cesium3DTileFeature") {
            this.get3DFeatureGfi();
        }
        else if (this.get("typ") === "Entities3D") {
            this.get3DFeatureGfi();
        }
        else {
            this.getVectorGfi();
        }
    },

    /**
     * Requestor function for GFI of WMS layers with infoFormat "text/html"
     * @fires Core#RadioRequestUtilGetProxyURL
     * @param   {function} successFunction function to be called after successfull request
     * @returns {void}
     */
    getWmsHtmlGfi: function (successFunction) {
        const gfiUrl = this.get("gfiUrl");

        $.ajax({
            url: this.get("useProxyUrlForGfi") === true ? Radio.request("Util", "getProxyURL", gfiUrl) : gfiUrl,
            context: this,
            success: successFunction,
            error: this.gfiErrorHandler
        });
    },

    /**
     * Parse response for Bohrdatenportal
     * @param   {string} data string to be parsed as html
     * @returns {void}
     */
    parseWmsBohrdatenGfi: function (data) {
        const domNodes = $.parseHTML(data);

        try {
            // bei domNodes.length < 3 = nur der xml-header (?xml version='1.0' encoding='UTF-8'?) ohne html
            if (domNodes.length > 3) {
                window.open(this.get("gfiUrl"), "weitere Informationen", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700");
            }
            this.setIsReady(true);
        }
        catch {
            this.setIsReady(true);
        }
    },

    /**
     * Parse response for WMS as text/html
     * @param   {string} data response as html
     * @returns {void}
     */
    parseWmsHtmlGfi: function (data) {
        const gfiFeatures = {"html": this.get("gfiUrl")};

        try {
            if ($(data).find("tbody").children().length >= 1) {
                this.set("gfiContent", [gfiFeatures]);
            }
            this.setIsReady(true);
        }
        catch {
            this.setIsReady(true);
        }
    },
    /**
     * Requestor function for GFI of WMS layers
     * @fires Core#RadioRequestUtilGetProxyURL
     * @param   {function} successFunction function to be called after successfull request
     * @returns {void}
     */
    getWmsGfi: function (successFunction) {
        let url = this.get("gfiUrl");

        url = url.replace(/SLD_BODY=.*?&/, "");
        $.ajax({
            url: this.get("useProxyUrlForGfi") === true ? Radio.request("Util", "getProxyURL", url) : url,
            method: "GET",
            context: this,
            success: successFunction,
            error: this.gfiErrorHandler
        });
    },

    /**
     * Error handler for unanswered GFI requests
     * @fires Alerting#RadioTriggerAlertAlert
     * @param   {object} jqXHR error object
     * @returns {void}
     */
    gfiErrorHandler: function (jqXHR) {
        this.setIsReady(true);
        console.warn("Error occured requesting GFI with status '" + jqXHR.status + "' and errorMessage '" + jqXHR.statusText + "'");
        Radio.trigger("Alert", "alert", i18next.t("common:modules.tools.gfi.themes.errorMessage", {name: this.get("name"), id: this.get("id")}));
    },

    /**
     * Returns multiple attribute names in XML features.
     * @param   {xml} node Feature-Node
     * @returns {string[]} Attributnamen
     */
    getMultiTags: function (node) {
        let multiTagsUnique = [],
            tagNameList,
            tagNameListSorted,
            multiTags;

        if (node.hasOwnProperty("firstElementChild") && node.firstElementChild.hasOwnProperty("children")) {
            tagNameList = node.firstElementChild.children.map(element => element.tagName);
            tagNameListSorted = tagNameList.sort((nameA, nameB) => nameA - nameB);
            multiTags = tagNameListSorted.filter((tagName, index, list) => tagName === list[index + 1]);

            multiTagsUnique = [...new Set(multiTags)];
        }

        return multiTagsUnique;
    },

    /**
     * Replaces the multiTags of a feature with a tag with accumulated value.
     * @param   {string[]} multiTags multiple tags in one feature
     * @param   {xml} childNode Feature-Node
     * @returns {void}
     */
    replaceMultiNodes: function (multiTags, childNode) {
        multiTags.forEach(tagName => {
            const nodeList = childNode.getElementsByTagName(tagName),
                nodeListValue = nodeList.map(node => node.innerHTML),
                firstNode = nodeList[0];

            firstNode.innerHTML = JSON.stringify({
                multiTag: nodeListValue
            });
            for (let i = nodeList.length - 1; i >= 1; i--) {
                childNode.firstElementChild.removeChild(nodeList[i]);
            }
        });
    },

    /**
     * Replace multi attributes of a feature
     * @param   {xml} xml GFI
     * @returns {void}
     */
    parseMultiElementNodes: function (xml) {
        const childNodes = $(xml).find("msGMLOutput,gml\\:featureMember,featureMember");

        childNodes.toArray().forEach(childNode => {
            const multiTags = this.getMultiTags(childNode);

            this.replaceMultiNodes(multiTags, childNode);
        });
    },

    /**
     * Parse feature info response of a WMS
     * @param {(string|xml)} data response to parse
     * @returns {void}
     */
    parseWmsGfi: function (data) {
        const gfiList = [],
            dat = typeof data === "string" ? $.parseXML(data) : data; // handle non text/xml responses arriving as string

        let gfiFormat = {},
            pgfi = [],
            gfiFeatures = {};

        this.parseMultiElementNodes(dat);
        // parse result, try built-in Ol-format first
        gfiFormat = new WMSGetFeatureInfo();
        // das reverse wird fürs Planportal gebraucht SD 18.01.2016
        gfiFeatures = gfiFormat.readFeatures(dat, {
            dataProjection: Radio.request("MapView", "getProjection")
        }).reverse();

        // ESRI is not parsed by the Ol-format
        if (gfiFeatures.length === 0) {
            if (dat.getElementsByTagName("FIELDS")[0] !== undefined) {
                dat.getElementsByTagName("FIELDS").forEach(element => {
                    const gfi = {};

                    element.attributes.forEach(attribute => {
                        const key = attribute.localName;

                        if (this.isValidValue(attribute.value)) {
                            gfi[key] = attribute.value;
                        }
                        else if (this.isValidValue(attribute.textContent)) {
                            gfi[key] = attribute.textContent;
                        }
                        else {
                            gfi[key] = "";
                        }
                    });

                    gfiList.push(gfi);
                });
            }
        }
        else { // OS (deegree, UMN, Geoserver) is parsed by Ol-format
            gfiFeatures.forEach(feature => {
                gfiList.push(feature.getProperties());
            });
        }

        if (gfiList.length > 0) {
            pgfi = this.translateGFI(gfiList, this.get("gfiAttributes"));
            pgfi = this.getManipulateDate(pgfi);
            if (
                this.get("gfiTheme") !== "table"
                &&
                // GFI is not supposed to display multiple nodes, since there can only be one area at a spot.
                // However, sometimes the server returns multiple areas for or one spot, which is not correct
                // and would result in displaying multiple GFI nodes, which is suppressed right here.
                this.get("gfiTheme") !== "flaecheninfo"
            ) {
                this.cloneCollModels(pgfi);
            }
            this.setGfiContent(pgfi);
        }
        this.setIsReady(true);
    },
    /**
     * Clones the models in the collection when a service returns more than one GFI query feature..
     * @param {object} pgfi - pgfi
     * @returns {void}
     */
    cloneCollModels: function (pgfi) {
        let clone;

        pgfi.forEach((singlePgfi, index) => {
            if (index > 0 && this.collection) {
                clone = this.clone();
                clone.set("gfiContent", [singlePgfi]);
                clone.set("id", Radio.request("Util", "uniqueId"));
                clone.set("isReady", true);
                if (this.get("gfiTheme") === "trinkwasser") {
                    clone.splitContent();
                }
                this.collection.add(clone);
            }
        }, this);
    },

    /**
     * adds the gfiContent for a 3D Cesium TileFeature or a 3d Cesium Entity.
     * The Attributes are saved directly at the model in the attributes property
     * @returns {void}
     */
    get3DFeatureGfi: function () {
        let gfiContent;

        gfiContent = this.translateGFI([this.get("attributes")], this.get("gfiAttributes"));
        gfiContent = this.getManipulateDate(gfiContent);
        this.setGfiContent(gfiContent);
        this.setIsReady(true);
    },

    /**
     * todo add jsdoc info about this function
     * @returns {void}
     */
    getVectorGfi: function () {
        const gfiFeatureList = this.get("gfiFeatureList");
        let gfiContent;

        if (gfiFeatureList.length > 0) {
            gfiContent = this.translateGFI([gfiFeatureList[0].getProperties()], this.get("gfiAttributes"));
            gfiContent = this.getManipulateDate(gfiContent);

            gfiContent = Object.assign(gfiContent, {
                allProperties: gfiFeatureList[0].getProperties()
            });
            this.setGfiContent(gfiContent);
            this.setIsReady(true);
        }
    },

    /**
     * Checks validity of a key according to configured list of ignored keys
     * @param {string}      key         Name of the key
     * @fires Core#RadioRequestUtilGetIgnoredKeys
     * @returns {boolean}   isValidKey  returns the validita of a key
     */
    isValidKey: function (key) {
        const ignoredKeys = Config.ignoredKeys ? Config.ignoredKeys : Radio.request("Util", "getIgnoredKeys");
        let isValidKey = true;

        if (ignoredKeys.includes(key.toUpperCase())) {
            isValidKey = false;
        }

        return isValidKey;
    },

    /**
     * checks if the value is a string or array and if it is a string,
     * whether the value is unequal to NULL or an empty string
     * @param {(string|Array)} value - value
     * @returns {boolean} true or false
     */
    isValidValue: function (value) {
        let isValid = false;

        if (value && typeof value === "string" && value !== "" && value.toUpperCase() !== "NULL") {
            isValid = true;
        }
        else if (Array.isArray(value)) {
            isValid = true;
        }
        else if (typeof value === "number") {
            isValid = true;
        }
        return isValid;
    },

    /**
     * helper function: first letter upperCase, _ becomes " "
     * @param {string} str String to be beautified
     * @returns {void}
     */
    beautifyString: function (str) {
        return str.substring(0, 1).toUpperCase() + str.substring(1).replace("_", " ");
    },

    /**
     * helper function to provide information about a "multiTag" attribute on a non parsed JSON string
     * @param {string} str JSON string to parse and to check
     * @returns {void}
     */
    isMultiTag: function (str) {
        let test;

        try {
            test = JSON.parse(str);
        }
        catch (e) {
            return false;
        }
        if (typeof test === "object" && test.hasOwnProperty("multiTag")) {
            return true;
        }
        return false;
    },

    /**
      * Selector of feature infos to show
      * @param   {object[]}         gfiList        gfiList list array with feature infos
      * @param   {(string|object)}  gfiAttributes  Flag to describe necessary gfi infos "ignore" || "showAll" or specific list of objects
      * @returns {object[]}         pgfi           List of objects
      */
    translateGFI: function (gfiList, gfiAttributes) {
        const pgfi = [];

        if (gfiAttributes === "ignore") {
            return pgfi;
        }

        gfiList.forEach(element => {
            let gfi = this.removeInvalidEntries(element);

            if (gfiAttributes === "showAll") {
                gfi = this.beautifyGfiKeys(gfi);
            }
            else {
                gfi = this.prepareGfiByAttributes(gfi, gfiAttributes);
            }
            if (Object.keys(gfi).length > 0) {
                pgfi.push(gfi);
            }
        });

        return pgfi;
    },

    /**
     * Prepares the gfi by the configured attributes.
     * @param {Object} gfi Gfi object.
     * @param {Object} attributes Gfi attributes.
     * @returns {Object} - Prepared gfi by configured attributes.
     */
    prepareGfiByAttributes: function (gfi, attributes) {
        const preparedGfi = {};

        Object.keys(attributes).forEach(key => {
            let newKey = attributes[key],
                value = this.prepareGfiValue(gfi, key);

            if (typeof newKey === "object") {
                value = this.prepareGfiValueFromObject(key, newKey, gfi);
                newKey = newKey.name;
            }
            if (value && value !== "undefined") {
                preparedGfi[newKey] = value;
            }
        });

        return preparedGfi;
    },

    /**
     * Derives the gfi value if the value is an object.
     * @param {*} key Key of gfi Attribute.
     * @param {Object} obj Value of gfi attribute.
     * @param {Object} gfi Gfi object.
     * @returns {*} - Prepared Value from gfi.
     */
    prepareGfiValueFromObject: function (key, obj, gfi) {
        const type = obj.hasOwnProperty("type") ? obj.type : "string",
            format = obj.hasOwnProperty("format") ? obj.format : "DD.MM.YYYY HH:mm:ss",
            condition = obj.hasOwnProperty("condition") ? obj.condition : null;
        let preparedValue = this.prepareGfiValue(gfi, key),
            date;

        if (condition) {
            preparedValue = this.getValueFromCondition(key, condition, gfi);
        }
        switch (type) {
            case "date": {
                date = moment(String(preparedValue));
                if (date.isValid()) {
                    preparedValue = moment(String(preparedValue)).format(format);
                }
                break;
            }
            // default equals to obj.type === "string"
            default: {
                preparedValue = String(preparedValue);
            }
        }
        if (preparedValue && preparedValue !== "undefined") {
            preparedValue = this.appendSuffix(preparedValue, obj.suffix);
        }

        return preparedValue;
    },

    /**
     * Derives the value from the given condition.
     * @param {String} key Key.
     * @param {String} condition Condition to filter gfi.
     * @param {Object} gfi Gfi object.
     * @returns {*} - Value that matches the given condition.
     */
    getValueFromCondition: function (key, condition, gfi) {
        let valueFromCondition,
            match;

        if (condition === "contains") {
            match = Object.keys(gfi).filter(key2 => {
                return key2.includes(key);
            })[0];
            valueFromCondition = gfi[match];
        }
        else if (condition === "startsWith") {
            match = Object.keys(gfi).filter(key2 => {
                return key2.startsWith(key);
            })[0];
            valueFromCondition = gfi[match];
        }
        else if (condition === "endsWith") {
            match = Object.keys(gfi).filter(key2 => {
                return key2.endsWith(key);
            })[0];
            valueFromCondition = gfi[match];
        }
        else {
            valueFromCondition = gfi[key];
        }

        return valueFromCondition;

    },

    /**
     * Appends a suffix if available.
     * @param {*} value Value to append suffix.
     * @param {*} suffix Suffix
     * @returns {String} - Value with suffix.
     */
    appendSuffix: function (value, suffix) {
        let valueWithSuffix = value;

        if (suffix) {
            valueWithSuffix = String(valueWithSuffix) + " " + suffix;
        }
        return valueWithSuffix;
    },

    /**
     * Returns the value of the given key. Also considers, that the key may be an object path.
     * @param {Object} gfi Gfi object.
     * @param {String} key Key to derive value from.
     * @returns {*} - Value from key.
     */
    prepareGfiValue: function (gfi, key) {
        const isPath = key.startsWith("@");
        let value = gfi[key];

        if (isPath) {
            value = this.getValueFromPath(gfi, key);
        }
        return value;
    },

    /**
     * Parses the path and returns the value at the position of the path.
     * @param {Object} gfi Gfi object.
     * @param {String} path Key that is an object path.
     * @returns {*} - Value of gfi from path.
     */
    getValueFromPath: function (gfi, path) {
        const pathParts = path.substring(1).split(".");
        let value = gfi;

        pathParts.forEach(part => {
            value = value ? value[part] : undefined;
        });

        return value;
    },

    /**
     * Beautifies the keys of the gfi.
     * @param {Object} gfi Gfi object.
     * @returns {Object} - Gfi with beautified keys.
     */
    beautifyGfiKeys: function (gfi) {
        const beautifiedGfi = {};

        Object.keys(gfi).forEach(key => {
            const value = gfi[key],
                beautifiedKey = this.beautifyString(key);

            beautifiedGfi[beautifiedKey] = value;
        });
        return beautifiedGfi;
    },

    /**
     * Removes invalid entries from gfi
     * @param {Object} gfi Gfi object.
     * @returns {Object} - Gfi with valid entries.
     */
    removeInvalidEntries: function (gfi) {
        const gfiWithValidEntries = {};

        Object.keys(gfi).forEach(key => {
            let value = gfi[key];

            if (this.get("gfiTheme") === "table") {
                if (this.isValidKey(key)) {
                    gfiWithValidEntries[key] = value;
                }
            }
            else if (this.isValidKey(key) && this.isValidValue(value)) {
                if (this.isMultiTag(value)) {
                    value = JSON.parse(value).multiTag;
                    if (Array.isArray(value)) {
                        value = value.join("</br>");
                    }
                }
                value = typeof value === "string" ? value.trim() : value;
                gfiWithValidEntries[key] = value;
            }
        });
        return gfiWithValidEntries;
    },

    /**
     * Checks all values and checks if it is a "DD-MM-YYYY"-compliant date.
     * If yes, it will be converted to DD.MM.YYYY format.
     * @param  {object} content - GFI Attributes
     * @return {object} content
     */
    getManipulateDate: function (content) {
        content.forEach(element => {
            Object.keys(element).forEach(key => {
                const value = element[key];

                if (moment(value, "DD-MM-YYYY", true).isValid() === true) {
                    element[key] = moment(value).format("DD.MM.YYYY");
                }
            });
        });
        return content;
    },

    /**
     * Setter for uiStyle
     * @param {string} value Value for uiStyle
     * @returns {void}
     */
    setUiStyle: function (value) {
        this.set("uiStyle", value);
    },

    /**
     * Setter for isVisible
     * @param {boolean} value Value for isVsible
     * @returns {void}
     */
    setIsVisible: function (value) {
        this.set("isVisible", value);
    },

    /**
     * Setter for gfiContent
     * @param {object} value Value for gfiContent
     * @fires Core#RadioRequestUtilGetUiStyle
     * @returns {void}
     */
    setGfiContent: function (value) {
        this.setUiStyle(Radio.request("Util", "getUiStyle"));
        this.set("gfiContent", value);
    },

    /**
     * Setter for isReady
     * @param {boolean} value Value for isReady
     * @returns {void}
     */
    setIsReady: function (value) {
        this.set("isReady", value);
    }
});

export default Theme;
