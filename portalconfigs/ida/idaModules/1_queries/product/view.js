define(function (require) {
    var Backbone = require("backbone"),
        Template = require("text!idaModules/1_queries/product/template.html"),
        Model = require("idaModules/1_queries/product/model"),
        Radio = require("backbone.radio"),
        ProductView;

    ProductView = Backbone.View.extend({
        el: "#produkt",
        className: "panel panel-default",
        template: _.template(Template),
        model: new Model(),
        events: {
            "click .produktauswahl": "checkProdukt",
            "click .produktinfo": "showProduktInfo"
        },
        initialize: function () {
            this.listenTo(this.model, "change:header", this.setHeader);
            this.listenTo(this.model, "change:produkte", this.setProdukte);

            this.render();
        },
        setActive: function (evt) {
            var activeButton = $(evt.target),
                allButtonsArr = $(activeButton).closest(".btn-group").find(".btn");

            allButtonsArr.each(function () {
                $(this).removeClass("active");
            });
            $(activeButton).addClass("active");
        },
        setProdukte: function () {
            var produkte = this.model.get("produkte");

            $("#produktliste").empty();
            if (produkte.length === 0) {
                Radio.trigger("Alert", "alert", {
                    text: "Für die angegebene Lage, Jahreszahl und Nutzungsart kann leider kein Produkt geliefert werden. Bitte treffen Sie eine andere Auswahl.",
                    kategorie: "alert-danger",
                    position: "center-center"
                });
            }
            else {
                _.each(produkte, function (produkt) {
                    var id = produkt.id,
                        value = produkt.value,
                        info = produkt.info,
                        btn = "<div class='col-xs-12 col-sm-6 col-md-4 col-lg-3'>",
                        btn = btn + "<div class='btn-group btn-group-justified'>",
                        btn = btn + "<div class='btn-group'>",
                        btn = btn + "<button id=" + id + " type='button' class='btn btn-default produktauswahl' title='" + info + "'>" + value + "</button>",
                        btn = btn + "</div>",
                        btn = btn + "<div class='btn-group'>",
                        btn = btn + "<button id=" + id + "_info type='button' class='btn btn-default produktinfo' title='Produktbeschreibung anzeigen'>",
                        btn = btn + "<span class='glyphicon glyphicon-info-sign' style='font-size: 14px !important;'></span>",
                        btn = btn + "<span class='sr-only'>Produktbeschreibung anzeigen</span>",
                        btn = btn + "</button>",
                        btn = btn + "</div>",
                        btn = btn + "</div>",
                        btn = btn + "</div>";

                    $("#produktliste").append(btn);
                });
            }
        },
        setHeader: function () {
            var header = this.model.get("header");

            $("#productheaderSuffix").text(header);
        },
        checkProdukt: function (evt) {
            this.setActive(evt);
            this.model.setProdukt(evt.target.id);
            evt.stopPropagation();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },
        showProduktInfo: function (evt) {
            var id = evt.currentTarget.id,
                btngroup = $("#" + id).parent().parent(),
                produktbtn = $(btngroup).find(".produktauswahl")[0],
                produktinfo = produktbtn.title;

            Radio.trigger("Alert", "alert", {text: produktinfo, position: "center-center"});
        }
    });

    return ProductView;
});
