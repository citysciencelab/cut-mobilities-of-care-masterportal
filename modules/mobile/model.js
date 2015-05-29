define([
    "backbone"
], function (Backbone) {

    var model = Backbone.Model.extend({
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
        }
    });

    return model;
});
