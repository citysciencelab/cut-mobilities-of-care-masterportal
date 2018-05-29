define(function (Backbone, Model, Template) {
    var Backbone = require("backbone"),
        Model = require("idaModules/2_brw/manually/model"),
        Template = require("text!idaModules/2_brw/manually/template.html"),
        Radio = require("backbone.radio"),
        ManuallyView;

    ManuallyView = Backbone.View.extend({
        el: "#brwliste",
        template: _.template(Template),
        events: {
            "keyup input[type=text]": "checkBRWNummer",
            "click #seite2_back": "backButtonClick"
        },
        initialize: function (jahr, nutzung, produkt) {
            var channel = Radio.channel("BRWSubViews");

            channel.on({
                "remove": this.destroy_view
            }, this);

            this.model = new Model();

            this.listenTo(this.model, "change:brwList", this.render);

            this.model.set("jahr", jahr);
            this.model.set("nutzung", nutzung);
            this.model.set("produkt", produkt);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },
        /*
        * Wird zweimal gerufen, wenn mit Strg + V eingefügt wird. Einmal pro Taste.
        */
        checkBRWNummer: function (evt) {
            if (evt.keyCode >= 48 && evt.keyCode <= 57 || evt.keyCode >= 96 && evt.keyCode <= 105) { // nur Zahlen
                this.requestBRW(evt);
            }
            else if (evt.keyCode === 86) { // könnte Strg + V sein
                this.requestBRW(evt);
            }
        },
        requestBRW: function (evt) {
            var wnum;

            if (evt.currentTarget.value.length === 7) {
                wnum = "0" + evt.currentTarget.value;
            }
            else if (evt.currentTarget.value.length === 8) {
                wnum = evt.currentTarget.value;
            }
            else {
                return;
            }
            var nutzung = evt.currentTarget.id.split("#")[0],
                jahr = evt.currentTarget.id.split("#")[1];

            this.model.requestBRWDetails(wnum, jahr, nutzung);
        },
        backButtonClick: function () {
            Radio.trigger("QueriesView", "show");
            this.trigger("remove", this);
            this.remove();

        },
        destroy_view: function () {
            this.model.destroy();
            this.remove();
        }
    });

    return ManuallyView;
});
