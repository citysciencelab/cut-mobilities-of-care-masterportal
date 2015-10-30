define([
    "jquery",
    "backbone",
    "eventbus",
    "test/seite1/model",
    "test/seite1_lage/view",
    "modules/searchbar/view"
], function ($, Backbone, EventBus, Model, Seite1_Lage, Searchbar) {
    /*
     *
     */
    var Seite1View = Backbone.View.extend({
        el: "#page1",
        model: Model,
        events: {
//            "change": "change",
//            "keyup": "keyup"
        },
        initialize: function () {
        },
        keyup: function (evt) {
            console.log(evt.target.id);
        }
    });

    return new Seite1View;
});
