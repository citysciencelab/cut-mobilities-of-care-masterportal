define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        LeaseModel;

    LeaseModel = Backbone.Model.extend({
        defaults: {
            buildinglease: false
        },

        initialize: function () {
            var channel = Radio.channel("LeaseModel");

            this.listenTo(this, {
                "change:buildinglease": function () {
                    channel.trigger("newErbbaurecht", this.getBuildinglease());
                }
            });
        },
        setBuildingLease: function (val, text) {
            var bl = val === "TRUE" ? true : false;

            this.set("buildinglease", bl);
            this.set("header", text);
        },
        getBuildinglease: function () {
            return this.get("buildinglease");
        }
    });

    return LeaseModel;
});
