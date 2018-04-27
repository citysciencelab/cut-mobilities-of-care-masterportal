define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        WPS;

     WPS = Backbone.Model.extend({
        initialize: function () {
            var channel = Radio.channel("WPS");
            this.listenTo(channel, {
                "request": this.request
            }, this);
        },
        request: function (wpsID, requestID, data) {
            var url = this.createUrl(wpsID);
        }
    });

    return WPS;
});
