define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        UseModel;

    UseModel = Backbone.Model.extend({
        defaults: {
            nutzung: ""
        },
        initialize: function () {
            var channel = Radio.channel("UseModel");

            this.listenTo(this, {
                "change:nutzung": function () {
                    channel.trigger("newNutzung", this.getNutzung());
                }
            });
        },
        setNutzung: function (val) {
            this.set("nutzung", val);
            this.set("header", val);
        },
        getNutzung: function () {
            return this.get("nutzung");
        }
    });

    return UseModel;
});
