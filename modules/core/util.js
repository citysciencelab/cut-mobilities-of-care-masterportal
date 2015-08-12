define([
    "backbone",
    "require"
], function (Backbone, Require) {

    var Util = Backbone.Model.extend({
        isAndroid: function () {
            return navigator.userAgent.match(/Android/i);
        },
        isApple: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        isOpera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        isWindows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        isAny: function () {
            return (this.isAndroid() || this.isApple() || this.isOpera() || this.isWindows());
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
        /** Umwandeln der services*.json-URLs in lokale Proxy-URL*/
        getProxyURL: function (url) {
            var newURL;

            if (url.indexOf("http://WSCA0620.fhhnet.stadt.hamburg.de") !== -1) {
                newURL = url.replace("http://WSCA0620.fhhnet.stadt.hamburg.de", "/wsca0620");
                // remove ports here, are handled in proxy conf
                newURL = newURL.replace(":8399", "");
            }
            else if (url.indexOf("http://wsca0620.fhhnet.stadt.hamburg.de") !== -1) {
                newURL = url.replace("http://wsca0620.fhhnet.stadt.hamburg.de", "/wsca0620");
                // remove ports here, are handled in proxy conf
                newURL = newURL.replace(":8399", "");
            }
            else if (url.indexOf("http://bsu-ims.fhhnet.stadt.hamburg.de") !== -1) {
                newURL = url.replace("http://bsu-ims.fhhnet.stadt.hamburg.de", "/bsu-ims");
                // remove ports here, are handled in proxy conf
                newURL = newURL.replace(":8080", "");
            }
            else if (url.indexOf("http://bsu-ims") !== -1) {
                newURL = url.replace("http://bsu-ims", "/bsu-ims");
                // remove ports here, are handled in proxy conf
                newURL = newURL.replace(":8080", "");
            }
            else if (url.indexOf("http://bsu-uio.fhhnet.stadt.hamburg.de") !== -1) {
                newURL = url.replace("http://bsu-uio.fhhnet.stadt.hamburg.de", "/bsu-uio");
                // remove ports here, are handled in proxy conf
                newURL = newURL.replace(":8083", "");
            }
            else if (url.indexOf("http://bsu-uio") !== -1) {
                newURL = url.replace("http://bsu-uio", "/bsu-uio");
                // remove ports here, are handled in proxy conf
                newURL = newURL.replace(":8083", "");
            }
            else if (url.indexOf("http://geofos.fhhnet.stadt.hamburg.de") !== -1) {
                newURL = url.replace("http://geofos.fhhnet.stadt.hamburg.de", "/geofos");
            }
            else if (url.indexOf("http://geofos") !== -1) {
                newURL = url.replace("http://geofos", "/geofos");
            }
            else if (url.indexOf("http://wscd0095") !== -1) {
                newURL = url.replace("http://wscd0095", "/geofos");
            }
            else if (url.indexOf("http://hmbtg.geronimus.info") !== -1) {
                newURL = url.replace("http://hmbtg.geronimus.info", "/hmbtg");
            }
            else if (url.indexOf("http://lgvfds01.fhhnet.stadt.hamburg.de") !== -1) {
                newURL = url.replace("http://lgvfds01.fhhnet.stadt.hamburg.de", "/lgvfds01");
            }
            else if (url.indexOf("http://lgvfds02.fhhnet.stadt.hamburg.de") !== -1) {
                newURL = url.replace("http://lgvfds02.fhhnet.stadt.hamburg.de", "/lgvfds02");
            }
            else if (url.indexOf("http://wscd0096") !== -1) {
                newURL = url.replace("http://wscd0096", "/wscd0096");
            }
            // ab hier Internet
            else if (url.indexOf("http://extmap.hbt.de") !== -1) {
                newURL = url.replace("http://extmap.hbt.de", "/extmap");
            }
            else if (url.indexOf("http://gateway.hamburg.de") !== -1) {
                newURL = url.replace("http://gateway.hamburg.de", "/gateway-hamburg");
            }
            else if (url.indexOf("http://geodienste-hamburg.de") !== -1) {
                newURL = url.replace("http://geodienste-hamburg.de", "/geodienste-hamburg");
            }
            else if (url.indexOf("http://geoportal.kreis-swm.de") !== -1) {
                    newURL = url.replace("http://geoportal.kreis-swm.de", "/gpkswm");
                }
            else {
                newURL = url;
            }

            return newURL;
        }
    });

    return new Util();
});
