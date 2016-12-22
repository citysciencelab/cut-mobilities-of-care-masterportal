define([
    "jquery",
    "backbone",
    "idaModules/1_queries/use/model"
], function ($, Backbone, Model) {
    "use strict";
    var UseView = Backbone.View.extend({
        el: "#nutzung",
        model: Model,
        events: {
            "change #nutzungdropdown": "checkNutzung"
        },
        initialize: function () {
        },
        checkNutzung: function (evt) {
            this.model.setNutzung(evt.target.value);
        }
    });

    return new UseView;
});
