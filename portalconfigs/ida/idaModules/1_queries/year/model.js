define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        YearModel;

    YearModel = Backbone.Model.extend({
        defaults: {
            maxJahr: "",
            minJahr: "",
            jahr: "",
            jahreText: ""
        },
        initialize: function () {
            var channel = Radio.channel("YearModel");

            this.listenTo(this, {
                "change:jahr": function () {
                    channel.trigger("newJahr", this.getJahr());
                }
            });
        },
        setJahr: function (jahr) {
            jahr = parseInt(jahr, 10);
            if (_.isNaN(jahr) === false && jahr >= this.get("minJahr") && jahr <= this.get("maxJahr")) {
                this.unset("jahr", {silent: true});
                this.set("jahr", jahr);
                this.set("header", jahr);
            }
            else {
                this.set("jahr", "");
                this.set("header", "");
            }
        },
        getJahr: function () {
            return this.get("jahr");
        }
    });

    return YearModel;
});
