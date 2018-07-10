define(function (require) {
    var Config = require("config"),
        $ = require("jquery"),
        Util;

    Util = Backbone.Model.extend({
        defaults: {
            // isViewMobile: false,
            config: "",
            ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"]
        },
        initialize: function () {
            var channel = Radio.channel("Util"),
                uiStyle = Config.uiStyle ? Config.uiStyle.toUpperCase() : "DEFAULT";

            channel.reply({
                "isViewMobile": this.getIsViewMobile,
                "getPath": this.getPath,
                "getProxyURL": this.getProxyURL,
                "isApple": this.isApple,
                "isAndroid": this.isAndroid,
                "isOpera": this.isOpera,
                "isWindows": this.isWindows,
                "isChrome": this.isChrome,
                "isInternetExplorer": this.isInternetExplorer,
                "isAny": this.isAny,
                "getConfig": this.getConfig,
                "getUiStyle": this.getUiStyle,
                "getIgnoredKeys": this.getIgnoredKeys,
                "punctuate": this.punctuate,
                "sort": this.sort
            }, this);

            channel.on({
                "hideLoader": this.hideLoader,
                "showLoader": this.showLoader,
                "setUiStyle": this.setUiStyle
            }, this);

            // initial isMobileView setzen
            this.toggleIsViewMobile();

            this.listenTo(this, {
                "change:isViewMobile": function () {
                    channel.trigger("isViewMobileChanged", this.getIsViewMobile());
                }
            });

            $(window).on("resize", _.bind(this.toggleIsViewMobile, this));

            this.setUiStyle(uiStyle);
            this.parseConfigFromURL();
        },
        /**
         * converts value to String and rewrites punctuation rules. The 1000 separator is "." and the decimal separator is a ","
         * @param  {[type]} value - feature attribute values
         * @returns {string} punctuated value
         */
        punctuate: function (value) {
            var pattern = /(-?\d+)(\d{3})/,
                stringValue = value.toString(),
                predecimals = stringValue;

            if (stringValue.indexOf(".") !== -1) {
                predecimals = stringValue.split(".")[0];
            }
            while (pattern.test(predecimals)) {
                predecimals = predecimals.replace(pattern, "$1.$2");
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
        sortArray: function (input) {
            return input.sort(this.sortAlphaNum);
        },
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
        sortObjects: function (input, first, second) {
            var sortedObj = input;

            // sort last property first in _.chain()
            // https://stackoverflow.com/questions/16426774/underscore-sortby-based-on-multiple-attributes
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
        isAndroid: function () {
            return navigator.userAgent.match(/Android/i);
        },
        /**
         * Sucht im userAgent nach dem String iPhone, iPod oder iPad.
         * @return {Array|null} - Liefert ein Array mit den Ergebnissen. Gibt null zurück, wenn nichts gefunden wird.
         */
        isApple: function () {
            return navigator.userAgent.match(/iPhone|iPod|iPad/i);
        },
        isOpera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        isWindows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        isChrome: function () {
            var isChrome = false;

            if (/Chrome/i.test(navigator.userAgent)) {
                isChrome = true;
            }
            return isChrome;
        },
        isAny: function () {
            return this.isAndroid() || this.isApple() || this.isOpera() || this.isWindows();
        },
        isInternetExplorer: function () {
            var ie = false;

            if (/MSIE 9/i.test(navigator.userAgent)) {
                ie = "IE9";
            }
            else if (/MSIE 10/i.test(navigator.userAgent)) {
                ie = "IE10";
            }
            else if (/rv:11.0/i.test(navigator.userAgent)) {
                ie = "IE11";
            }
            return ie;
        },
        getPath: function (path) {
            var baseUrl = require.toUrl("").split("?")[0];

            if (path) {
                if (path.indexOf("/") === 0) {
                    baseUrl = "";
                }
                else if (path.indexOf("http") === 0) {
                    baseUrl = "";
                }
                return baseUrl + path;
            }

            return "";

        },
        showLoader: function () {
            $("#loader").show();
        },
        hideLoader: function () {
            $("#loader").hide();
        },
        getProxyURL: function (url) {
            var parser = document.createElement("a"),
                protocol = "",
                result = "",
                hostname = "",
                port = "";

            parser.href = url;
            protocol = parser.protocol;

            if (protocol.indexOf("//") === -1) {
                protocol += "//";
            }

            port = parser.port;

            result = url.replace(protocol, "").replace(":" + port, "");
            // www und www2 usw. raus
            // hostname = result.replace(/www\d?\./, "");
            if (!parser.hostname) {
                parser.hostname = window.location.hostname;
            }
            hostname = parser.hostname.split(".").join("_");
            result = result.replace(parser.hostname, "/" + hostname);
            return result;
        },

        /**
         * Setter für Attribut isViewMobile
         * @param {boolean} value sichtbar
         * @return {undefined}
         */
        setIsViewMobile: function (value) {
            this.set("isViewMobile", value);
        },

        /**
         * Getter für Attribut isViewMobile
         * @return {boolean} mobil
         */
        getIsViewMobile: function () {
            return this.get("isViewMobile");
        },

        /**
         * Toggled das Attribut isViewMobile bei über- oder unterschreiten einer Fensterbreite von 768px
         * @return {undefined}
         */
        toggleIsViewMobile: function () {
            if (window.innerWidth >= 768) {
                this.setIsViewMobile(false);
            }
            else {
                this.setIsViewMobile(true);
            }
        },

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

        // getter for config
        getConfig: function () {
            return this.get("config");
        },

        // setter for config
        setConfig: function (value) {
            this.set("config", value);
        },

        // getter for UiStyle
        getUiStyle: function () {
            return this.get("uiStyle");
        },

        // setter for UiStyle
        setUiStyle: function (value) {
            this.set("uiStyle", value);
        },

        getIgnoredKeys: function () {
            return this.get("ignoredKeys");
        }
    });

    return Util;
});
