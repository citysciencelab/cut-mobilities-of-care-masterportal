define([
    "jquery",
    "backbone",
    "text!idaModules/1_queries/year/template.html",
    "idaModules/1_queries/year/model",
    "config"
], function ($, Backbone, Template, Model, Config) {
    "use strict";
    var YearView = Backbone.View.extend({
        el: "#jahr",
        template: _.template(Template),
        model: Model,
        events: {
            "keyup input[type=number]": "checkJahr"
        },
        initialize: function () {
            this.listenTo(this.model, "change:jahr", this.changeJahr);

            this.render();
            this.setJahre();
        },
        setJahre: function () {
            this.model.set("minJahr", Config.minJahr);
            this.model.set("maxJahr", Config.maxJahr);
            if ($("#validjahre")[0] && $("#validjahre")[0].textContent) {
                $("#validjahre").html("(" + Config.minJahr + " - " + Config.maxJahr + ")");
            }
            else {
                alert("Fehlendes Element in HTML: validjahre");
            }
            if ($("#jahreText")[0] && $("#jahreText")[0].textContent) {
                $("#jahreText").html(Config.jahreText);
            }
            else {
                alert("Fehlendes Element in HTML: jahreText");
            }
        },
        checkJahr: function (evt) {
            this.model.setJahr(evt.currentTarget.value);
        },
        /*
        * Überschreibe die Jahreszahl, wenn gesettet, um Buchstaben zu löschen
        */
        changeJahr: function () {
            $("#jahresfeld").val(this.model.get("jahr"));
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    });

    return YearView;
});
