define(function (require) {
    var Backbone = require("backbone"),
        Template = require("text!idaModules/1_queries/year/template.html"),
        Model = require("idaModules/1_queries/year/model"),
        Config = require("config"),
        YearView;

    YearView = Backbone.View.extend({
        el: "#jahr",
        template: _.template(Template),
        model: new Model(),
        events: {
            "keyup input[type=number]": "checkJahr",
            "click input[type=number]": "checkJahr"
        },
        initialize: function () {
            this.listenTo(this.model, "change:header", this.setHeader);
            this.listenTo(this.model, "change:jahr", this.changeJahr);

            this.render();
            this.setJahre();
            this.model.setJahr(Config.maxJahr - 1);
        },
        setHeader: function () {
            var header = this.model.get("header");

            $("#yearheaderSuffix").text(header);
        },
        setJahre: function () {
            this.model.set("minJahr", Config.minJahr);
            this.model.set("maxJahr", Config.maxJahr);
            if ($("#validjahre")[0] && $("#validjahre")[0].textContent) {
                $("#validjahre").html("(" + Config.minJahr + " - " + Config.maxJahr + ")");
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Fehlendes Element in HTML: validjahre.</strong> " +
                        "Bitte laden Sie die Seite neu.",
                    kategorie: "alert-danger",
                    position: "center-center"
                });
            }
            if ($("#jahreText")[0] && $("#jahreText")[0].textContent) {
                $("#jahreText").html(Config.jahreText);
            }
            else {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Fehlendes Element in HTML: jahreText.</strong> " +
                        "Bitte laden Sie die Seite neu.",
                    kategorie: "alert-danger",
                    position: "center-center"
                });
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
