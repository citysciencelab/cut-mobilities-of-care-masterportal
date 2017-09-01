define([
    "backbone",
    "backbone.radio",
    "require"
], function (Backbone, Radio, Require) {

    var Util = Backbone.Model.extend({
        // defaults: {
        //     isViewMobile: false
        // },
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
                "isAny": this.isAny
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
            else {
                return false;
            }
        },
        isAny: function () {
            return (this.isAndroid() || this.isApple() || this.isOpera() || this.isWindows());
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
            else {
                return false;
            }
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

        /**
         * Setter für Attribut isViewMobile
         * @param {boolean} value
         */
        setIsViewMobile: function (value) {
            this.set("isViewMobile", value);
        },

        /**
         * Getter für Attribut isViewMobile
         * @return {boolean}
         */
        getIsViewMobile: function () {
            return this.get("isViewMobile");
        },

        /**
         * Toggled das Attribut isViewMobile bei über- oder unterschreiten einer Fensterbreite von 768px
         */
        toggleIsViewMobile: function () {
            if (window.innerWidth >= 768) {
                this.setIsViewMobile(false);
            }
            else {
                this.setIsViewMobile(true);
            }
        }
    });

    return Util;
});
