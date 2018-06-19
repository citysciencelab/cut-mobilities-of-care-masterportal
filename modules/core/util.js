define([
    "backbone",
    "jquery",
    "backbone.radio",
    "config",
    "require"
], function (Backbone, $, Radio, Config, Require) {

    var Util = Backbone.Model.extend({
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
                "getIgnoredKeys": this.getIgnoredKeys
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
            if (/Chrome/i.test(navigator.userAgent)) {
                return true;
            }

            return false;

        },
        isAny: function () {
            return this.isAndroid() || this.isApple() || this.isOpera() || this.isWindows();
        },
        isInternetExplorer: function () {
            if (/MSIE 9/i.test(navigator.userAgent)) {
                return "IE9";
            }
            else if (/MSIE 10/i.test(navigator.userAgent)) {
                return "IE10";
            }
            else if (/rv:11.0/i.test(navigator.userAgent)) {
                return "IE11";
            }

            return false;

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
