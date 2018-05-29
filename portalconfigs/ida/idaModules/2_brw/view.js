define(function (require) {
    var Backbone = require("backbone"),
        Model = require("idaModules/2_brw/model"),
        BRWManuellView = require("idaModules/2_brw/manually/view"),
        Seite3 = require("idaModules/3_parameter/view"),
        Template = require("text!idaModules/2_brw/template.html"),
        Radio = require("backbone.radio"),
        BRWView;

    BRWView = Backbone.View.extend({
        id: "bodenrichtwerte",
        template: _.template(Template),
        events: {
            "click .brw-info": "showInfo"
        },
        initialize: function (jahr, nutzung, produkt, lage, erbbaurecht) {
            var channel = Radio.channel("BRWView");

            channel.on({
                "remove": this.destroy_view
            }, this);

            this.model = new Model();

            Radio.trigger("Info", "setNavStatus", "navbar-2-brw");

            this.listenTo(this.model, "change:complete", this.weiter);

            this.model.set("jahr", jahr);
            this.model.set("nutzung", nutzung);
            this.model.set("produkt", produkt);
            this.model.set("lage", lage);
            this.model.set("erbbaurecht", erbbaurecht);
            this.model.set("brwList", []);
            this.render();
            this.BRWManuellView = new BRWManuellView(jahr, nutzung, produkt, lage);
            this.model.requestNecessaryData();
            this.listenTo(this.BRWManuellView, "remove", this.remove);
        },
        showInfo: function (evt) {
            var msg = this.model.getValForBRWInfo(evt);

            Radio.trigger("Alert", "alert", "Bitte wählen Sie in der interaktiven Bodenrichtwertkarte (Boris-HH) den passenden " +
                msg + " aus und geben die Bodenrichtwert-Nummer hier ein.");
        },
        weiter: function () {
            Radio.trigger("Alert", "alert:remove");
            new Seite3(this.model.get("lage"), this.model.get("params"), this.model.get("nutzung"), this.model.get("produkt"), this.model.get("brwList"), this.model.get("jahr"));
        },
        render: function () {
            var attr = this.model.toJSON();

            this.model.set("brwList", {}, {silent: true});
            this.$el.html(this.template(attr));
            $("#queries").after(this.$el.html(this.template(attr)));
            $("#queries").hide();
        },
        destroy_view: function () {
            Radio.trigger("BRWSubViews", "remove");
            this.model.destroy();
            this.remove();
        }
    });

    return BRWView;
});
