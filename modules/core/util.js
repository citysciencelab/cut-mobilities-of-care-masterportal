const Util = Backbone.Model.extend(/** @lends Util.prototype */{
    defaults: {
        config: "",
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
        uiStyle: "DEFAULT",
        proxy: true,
        proxyHost: "",
        loaderOverlayTimeoutReference: null,
        loaderOverlayTimeout: 40
    },
    /**
     * @class Util
     * @extends Backbone.Model
     * @memberof Core
     * @constructs
     * @property {String} config="" todo
     * @property {String[]} ignoredKeys=["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"] List of ignored attribute names when displaying attribute information of all layer types.
     * @property {String} uiStyle="DEFAULT" Controls the layout of the controls.
     * @property {String} proxy=true Specifies whether points should be replaced by underscores in URLs. This prevents CORS errors. Attention: A reverse proxy must be set up on the server side.
     * @property {String} proxyHost="" Hostname of a remote proxy (CORS must be activated there).
     * @property {String} loaderOverlayTimeoutReference=null todo
     * @property {String} loaderOverlayTimeout="20" Timeout for the loadergif.
     * @listens Core#RadioRequestUtilIsViewMobile
     * @listens Core#RadioRequestUtilGetProxyURL
     * @listens Core#RadioRequestUtilIsApple
     * @listens Core#RadioRequestUtilIsAndroid
     * @listens Core#RadioRequestUtilIsOpera
     * @listens Core#RadioRequestUtilIsWindows
     * @listens Core#RadioRequestUtilIsChrome
     * @listens Core#RadioRequestUtilIsInternetExplorer
     * @listens Core#RadioRequestUtilIsAny
     * @listens Core#RadioRequestUtilGetConfig
     * @listens Core#RadioRequestUtilGetUiStyle
     * @listens Core#RadioRequestUtilGetIgnoredKeys
     * @listens Core#RadioRequestUtilPunctuate
     * @listens Core#RadioRequestUtilSort
     * @listens Core#RadioRequestUtilConvertArrayOfObjectsToCsv
     * @listens Core#RadioRequestUtilGetPathFromLoader
     * @listens Core#RadioRequestUtilGetMasterPortalVersionNumber
     * @listens Core#RadioTriggerUtilHideLoader
     * @listens Core#RadioTriggerUtilShowLoader
     * @listens Core#RadioTriggerUtilSetUiStyle
     * @listens Core#RadioTriggerUtilCopyToClipboard
     * @listens Core#event:changeIsViewMobile
     * @fires Core#RadioTriggerIsViewMobileChanged
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerUtilHideLoader
     */
    initialize: function () {
        var channel = Radio.channel("Util");

        channel.reply({
            "isViewMobile": function () {
                return this.get("isViewMobile");
            },
            "getMasterPortalVersionNumber": this.getMasterPortalVersionNumber,
            "getProxyURL": this.getProxyURL,
            "isApple": this.isApple,
            "isAndroid": this.isAndroid,
            "isOpera": this.isOpera,
            "isWindows": this.isWindows,
            "isChrome": this.isChrome,
            "isInternetExplorer": this.isInternetExplorer,
            "isAny": this.isAny,
            "getConfig": function () {
                return this.get("config");
            },
            "getUiStyle": function () {
                return this.get("uiStyle");
            },
            "getIgnoredKeys": function () {
                return this.get("ignoredKeys");
            },
            "punctuate": this.punctuate,
            "sort": this.sort,
            "convertArrayOfObjectsToCsv": this.convertArrayOfObjectsToCsv,
            "getPathFromLoader": this.getPathFromLoader
        }, this);

        channel.on({
            "hideLoader": this.hideLoader,
            "showLoader": this.showLoader,
            "setUiStyle": this.setUiStyle,
            "copyToClipboard": this.copyToClipboard
        }, this);

        // initial isMobileView setzen
        this.toggleIsViewMobile();

        this.listenTo(this, {
            "change:isViewMobile": function () {
                channel.trigger("isViewMobileChanged", this.get("isViewMobile"));
            }
        });

        $(window).on("resize", _.bind(this.toggleIsViewMobile, this));
        this.parseConfigFromURL();
    },

    /**
     * Returns current Master Portal Version Number
     * @returns {string} Masterportal version number
     */
    getMasterPortalVersionNumber: function () {
        return require("../../package.json").version;
    },

    /**
     * converts value to String and rewrites punctuation rules. The 1000 separator is "." and the decimal separator is a ","
     * @param  {String} value - feature attribute values
     * @returns {string} punctuated value
     */
    punctuate: function (value) {
        var pattern = /(-?\d+)(\d{3})/,
            stringValue = value.toString(),
            decimals,
            predecimals = stringValue;

        if (stringValue.indexOf(".") !== -1) {
            predecimals = stringValue.split(".")[0];
            decimals = stringValue.split(".")[1];
        }
        while (pattern.test(predecimals)) {
            predecimals = predecimals.replace(pattern, "$1.$2");
        }
        if (decimals) {
            return predecimals + "," + decimals;
        }
        return predecimals;
    },

    /**
     * Sorting alorithm that distinguishes between array[objects] and other arrays.
     * arrays[objects] can be sorted by up to 2 object attributes
     * @param {array} input array that has to be sorted
     * @param {String} first first attribute an array[objects] has to be sorted by
     * @param {String} second second attribute an array[objects] has to be sorted by
     * @returns {array} sorted array
     */
    sort: function (input, first, second) {
        var sorted,
            isArrayOfObjects = _.every(input, function (element) {
                return _.isObject(element);
            });

        if (_.isUndefined(input)) {
            sorted = input;
        }
        else if (_.isArray(input) && !isArrayOfObjects) {
            sorted = this.sortArray(input);
        }
        else if (_.isArray(input) && isArrayOfObjects) {
            sorted = this.sortObjects(input, first, second);
        }

        return sorted;
    },

    /**
     * Sorts an array.
     * @param {Array} input array to sort.
     * @returns {Array} sorted array
     */
    sortArray: function (input) {
        return input.sort(this.sortAlphaNum);
    },

    /**
     * todo
     * @param {*} a todo
     * @param {*} b todo
     * @returns {*} todo
     */
    sortAlphaNum: function (a, b) {
        var regExAlpha = /[^a-zA-Z]/g,
            regExNum = /[^0-9]/g,
            aAlpha = String(a).replace(regExAlpha, ""),
            bAlpha = String(b).replace(regExAlpha, ""),
            aNum,
            bNum,
            returnVal = -1;

        if (aAlpha === bAlpha) {
            aNum = parseInt(String(a).replace(regExNum, ""), 10);
            bNum = parseInt(String(b).replace(regExNum, ""), 10);
            if (aNum === bNum) {
                returnVal = 0;
            }
            else if (aNum > bNum) {
                returnVal = 1;
            }
        }
        else {
            returnVal = aAlpha > bAlpha ? 1 : -1;
        }
        return returnVal;
    },

    /**
     * todo
     * @param {*} input todo
     * @param {*} first todo
     * @param {*} second todo
     * @returns {*} todo
     */
    sortObjects: function (input, first, second) {
        var sortedObj = input;

        sortedObj = _.chain(input)
            .sortBy(function (element) {
                return element[second];
            })
            .sortBy(function (element) {
                return parseInt(element[first], 10);
            })
            .value();

        return sortedObj;
    },

    /**
     * Kopiert den Inhalt des Event-Buttons in die Zwischenablage, sofern der Browser das Kommando akzeptiert.
     * behaviour of ios strange used solution from :
     * https://stackoverflow.com/questions/34045777/copy-to-clipboard-using-javascript-in-ios
     * @param  {el} el element to copy
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    copyToClipboard: function (el) {
        var oldReadOnly = el.readOnly,
            oldContentEditable = el.contentEditable,
            range = document.createRange(),
            selection = window.getSelection();

        el.readOnly = false;
        el.contentEditable = true;

        range.selectNodeContents(el);
        selection.removeAllRanges();
        if (!this.isInternetExplorer()) {
            selection.addRange(range);
        }
        el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

        el.readOnly = oldReadOnly;
        el.contentEditable = oldContentEditable;

        try {
            document.execCommand("copy");
            Radio.trigger("Alert", "alert", {
                text: "Inhalt wurde in die Zwischenablage kopiert.",
                kategorie: "alert-info",
                position: "top-center",
                animation: 2000
            });
        }
        catch (e) {
            Radio.trigger("Alert", "alert", {
                text: "Inhalt konnte nicht in die Zwischenablage kopiert werden.",
                kategorie: "alert-info",
                position: "top-center"
            });
        }
    },

    /**
     * Searches the userAgent for the string android.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isAndroid: function () {
        return navigator.userAgent.match(/Android/i);
    },

    /**
     * Searches the userAgent for the string iPhone, iPod or iPad.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isApple: function () {
        return navigator.userAgent.match(/iPhone|iPod|iPad/i);
    },

    /**
     * Searches the userAgent for the string opera.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isOpera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },

    /**
     * Searches the userAgent for the string windows.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isWindows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },

    /**
     * Searches the userAgent for the string chrome.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isChrome: function () {
        var isChrome = false;

        if ((/Chrome/i).test(navigator.userAgent)) {
            isChrome = true;
        }
        return isChrome;
    },

    /**
     * todo
     * @returns {*} todo
     */
    isAny: function () {
        return this.isAndroid() || this.isApple() || this.isOpera() || this.isWindows();
    },

    /**
     * Searches the userAgent for the string internet explorer.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     */
    isInternetExplorer: function () {
        var ie = false;

        if ((/MSIE 9/i).test(navigator.userAgent)) {
            ie = "IE9";
        }
        else if ((/MSIE 10/i).test(navigator.userAgent)) {
            ie = "IE10";
        }
        else if ((/rv:11.0/i).test(navigator.userAgent)) {
            ie = "IE11";
        }
        return ie;
    },

    /**
     * shows the loader gif
     * @fires Core#RadioTriggerUtilHideLoader
     * @returns {void}
     */
    showLoader: function () {
        clearTimeout(this.get("loaderOverlayTimeoutReference"));
        this.setLoaderOverlayTimeoutReference(setTimeout(function () {
            Radio.trigger("Util", "hideLoader");
        }, 1000 * this.get("loaderOverlayTimeout")));
        $("#loader").show();
    },

    /**
     * hides the loder gif until the timeout has expired
     * @returns {void}
     */
    hideLoader: function () {
        $("#loader").hide();
    },

    /**
     * Setter for loaderOverlayTimeoutReference
     * @param {*} timeoutReference todo
     * @returns {void}
     */
    setLoaderOverlayTimeoutReference: function (timeoutReference) {
        this.set("loaderOverlayTimeoutReference", timeoutReference);
    },

    /**
     * search the path from the loader gif
     * @returns {String} path to loader gif
     */
    getPathFromLoader: function () {
        return $("#loader").children("img").first().attr("src");
    },

    /**
     * rewrites the URL by replacing the dots with underlined
     * @param {Stirng} url url to rewrite
     * @returns {String} proxy URL
     */
    getProxyURL: function (url) {
        var parser = document.createElement("a"),
            protocol = "",
            result = url,
            hostname = "",
            port = "";

        if (this.get("proxy")) {
            parser.href = url;
            protocol = parser.protocol;

            if (protocol.indexOf("//") === -1) {
                protocol += "//";
            }

            port = parser.port;

            if (!parser.hostname) {
                parser.hostname = window.location.hostname;
            }

            if (parser.hostname === "localhost" || !parser.hostname) {
                return url;
            }

            result = url.replace(protocol, "").replace(":" + port, "");
            // www und www2 usw. raus
            // hostname = result.replace(/www\d?\./, "");
            hostname = parser.hostname.split(".").join("_");
            result = this.get("proxyHost") + "/" + result.replace(parser.hostname, hostname);

        }
        return result;
    },

    /**
     * Setter for attribute isViewMobile
     * @param {boolean} value visibility
     * @return {void}
     */
    setIsViewMobile: function (value) {
        this.set("isViewMobile", value);
    },

    /**
     * Toggled the isViewMobile attribute when the window width exceeds or falls below 768px
     * @return {void}
     */
    toggleIsViewMobile: function () {
        if (window.innerWidth >= 768) {
            this.setIsViewMobile(false);
        }
        else {
            this.setIsViewMobile(true);
        }
    },

    /**
     * todo
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    parseConfigFromURL: function () {
        var query = location.search.substr(1), // URL --> alles nach ? wenn vorhanden
            result = {},
            config;

        query.split("&").forEach(function (keyValue) {
            var item = keyValue.split("=");

            result[item[0].toUpperCase()] = decodeURIComponent(item[1]); // item[0] = key; item[1] = value;
        });

        if (_.has(result, "CONFIG")) {
            config = _.values(_.pick(result, "CONFIG"))[0];

            if (config.slice(-5) === ".json") {
                this.setConfig(config);
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Der Parametrisierte Aufruf des Portals ist leider schief gelaufen!</strong> <br> <small>Details: Config-Parameter verlangt eine Datei mit der Endung \".json\".</small>",
                    kategorie: "alert-warning"
                });
            }
        }
    },

    /**
     * converts an array of objects to csv
     * @param {object[]} data - array of object (no nested objects)
     * @param {string} colDeli - column delimiter
     * @param {string} lineDeli - line delimiter
     * @returns {string} csv
     */
    convertArrayOfObjectsToCsv: function (data, colDeli, lineDeli) {
        const keys = Object.keys(data[0]),
            columnDelimiter = colDeli || ",",
            lineDelimiter = lineDeli || "\n";

        // header line
        let result = keys.join(columnDelimiter) + lineDelimiter;

        data.forEach(function (item) {
            let colCounter = 0;

            keys.forEach(function (key) {
                if (colCounter > 0) {
                    result += columnDelimiter;
                }
                result += item[key];
                colCounter++;
            }, this);
            result += lineDelimiter;
        }, this);

        return result;
    },

    /**
     * Setter for config
     * @param {*} value todo
     * @returns {void}
     */
    setConfig: function (value) {
        this.set("config", value);
    },

    /**
     * Setter for uiStyle
     * @param {*} value todo
     * @returns {void}
     */
    setUiStyle: function (value) {
        this.set("uiStyle", value);
    }
});

export default Util;
