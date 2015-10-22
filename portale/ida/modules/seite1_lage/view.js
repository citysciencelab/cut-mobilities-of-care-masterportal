define([
    "jquery",
    "backbone",
    "eventbus",
    "modules/seite1/model"
], function ($, Backbone, EventBus, Model) {
    /*
     *
     */
    var Seite1LageView = Backbone.View.extend({
        el: "#lage",
        model: Model,
        events: {
            "click": "switchLage"
        },
        initialize: function () {
        },
        switchLage: function (evt) {
            if (evt.target.value === "radio1") {
                $("#adresse").show();
                $("#gemarkung").hide();
            }
            else {
                $("#gemarkung").show();
                $("#adresse").hide();
            }
        }
    });

    return new Seite1LageView;
});
