define([
    "jquery",
    "backbone",
    "eventbus",
    "idaModules/seite3/model"
], function ($, Backbone, EventBus, Model) {
    "use strict";
    var Seite2View = Backbone.View.extend({
        el: "#seite_drei",
        model: Model,
        events: {
        },
        initialize: function (brwList) {
            this.model.set("brwList", brwList);
            this.show();
        },
        weiter: function () {
            // dddd
        },
        show: function () {
            $("#seite_drei").show();
            $("#seite_zwei").hide();
            $("#seite_vier").hide();
        }
    });

    return Seite2View;
});
