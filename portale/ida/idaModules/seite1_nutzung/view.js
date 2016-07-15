define([
    "jquery",
    "backbone",
    "idaModules/seite1_nutzung/model"
], function ($, Backbone, Model) {
    "use strict";
    var Seite1NutzungView = Backbone.View.extend({
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

    return new Seite1NutzungView;
});
