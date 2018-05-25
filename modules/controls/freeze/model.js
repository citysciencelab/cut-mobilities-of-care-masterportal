define([
    "backbone",
    "backbone.radio"
], function (Backbone, Radio) {

    var FreezeModel = Backbone.Model.extend({

        defaults: {
            visible: false
        },

        initialize: function () {
            var channel = Radio.channel("Freeze");
        },

        setVisible: function (val) {
            this.set("visible", val);
        },

        getVisible: function () {
            return this.get("visible");
        }
    });

    return new FreezeModel();
});
