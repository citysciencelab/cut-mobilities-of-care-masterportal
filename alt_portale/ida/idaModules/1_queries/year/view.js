define([
    "jquery",
    "backbone",
    "idaModules/1_queries/year/model"
], function ($, Backbone, Model) {
    "use strict";
    var YearView = Backbone.View.extend({
        el: "#jahr",
        model: Model,
        events: {
            "keyup input[type=number]": "checkJahr"
        },
        initialize: function () {
            this.listenTo(this.model, "change:jahr", this.changeJahr);
        },
        checkJahr: function (evt) {
            this.model.setJahr(evt.currentTarget.value);
        },
        /*
        * Überschreibe die Jahreszahl, wenn gesettet, um Buchstaben zu löschen
        */
        changeJahr: function () {
            $("#jahresfeld").val(this.model.get("jahr"));
        }
    });

    return new YearView;
});
