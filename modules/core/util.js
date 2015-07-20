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
                    console.log(path);
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
        }
    });

    return new Util();
});
