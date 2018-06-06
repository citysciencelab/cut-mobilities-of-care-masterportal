define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Require = require("require"),
        $ = require("jquery"),
        Util;

    Util = Backbone.Model.extend({
        defaults: {
            // isViewMobile: false,
            config: "",
            ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"]
        },
        initialize: function () {
            var channel = Radio.channel("Util");

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
                "getIgnoredKeys": this.getIgnoredKeys,
                "punctuate": this.punctuate
            }, this);

            channel.on({
                "hideLoader": this.hideLoader,
                "showLoader": this.showLoader
            }, this);

            // initial isMobileView setzen
            this.toggleIsViewMobile();

            this.listenTo(this, {
                "change:isViewMobile": function () {
                    channel.trigger("isViewMobileChanged", this.getIsViewMobile());
                }
            });

            $(window).on("resize", _.bind(this.toggleIsViewMobile, this));
            $(window).on("resize", _.bind(this.updateMapHeight, this));

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
        updateMapHeight: function () {
            var navHeight = $("#main-nav").is(":visible") ? $("#main-nav").height() : 0,
                mapHeight = $(".lgv-container").height() - navHeight;

            $("#map").css("height", mapHeight + "px");
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
            return (this.isAndroid() || this.isApple() || this.isOpera() || this.isWindows());
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
            var baseUrl = Require.toUrl("").split("?")[0];

            if (path) {
                if (path.indexOf("/") === 0) {
                    baseUrl = "";
                }
                else if (path.indexOf("http") === 0) {
                    baseUrl = "";
                }
                return baseUrl + path;
            }
            else {
                return "";
            }
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

        setIsViewMobile: function (value) {
            this.set("isViewMobile", value);
        },

        getIsViewMobile: function () {
            return this.get("isViewMobile");
        },

        toggleIsViewMobile: function () {
            if (window.innerWidth >= 768) {
                this.setIsViewMobile(false);
            }
            else {
                this.setIsViewMobile(true);
            }
        },

        parseConfigFromURL: function (result) {
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

        getIgnoredKeys: function () {
            return this.get("ignoredKeys");
        }
    });

    return Util;
});
