define([
    "jquery",
    "backbone",
    "idaModules/seite1_jahr/model"
], function ($, Backbone, Model) {
    /*
     *
     */
    var Seite1JahrView = Backbone.View.extend({
        el: "#jahr",
        model: Model,
        events: {
            "keyup input[type=text]": "checkJahr"
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

    return new Seite1JahrView;
});
