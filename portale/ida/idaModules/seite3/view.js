define([
    "backbone",
    "eventbus",
    "idaModules/seite3/model",
    "text!idaModules/seite3/template.html",
    "idaModules/seite4/view"
], function (Backbone, EventBus, Model, Template, Seite4) {
    "use strict";
    var Seite3View = Backbone.View.extend({
        el: "#seite_drei",
        model: Model,
        template: _.template(Template),
        events: {
            "click #seite3_weiter": "weiter",
            "change #requestedParamsListe": "paramChanged",
            "change #WGFZ": "commaChanger",
            "change #FLAE": "commaChanger",
            "change #WOFL": "commaChanger",
            "change #EGFL": "commaChanger",
            "change #OGFL": "commaChanger",
            "change #WONKM": "commaChanger",
            "change #SONKM": "commaChanger",
            "change #JEZ": "commaChanger",
            "click .btn-group": "buttonChanger"
        },
        buttonChanger: function (evt) {
            $(evt.currentTarget).find("button").each(function () {
                if ($(this).hasClass("active") === true) {
                    $(this).removeClass("active");
                }
                else {
                    $(this).addClass("active");
                }
            });
            evt.target.id = evt.currentTarget.id;
            this.model.paramChanged(evt.target);
        },
        commaChanger: function (evt) {
            var id = evt.target.id,
                value = evt.target.value.replace(",", ".");

            $("#" + id).val(value);
        },
        initialize: function (lage, params, nutzung, produkt, brwList, jahr) {
            this.model.set("lage", lage),
            this.model.set("requestedParams", params),
            this.model.set("nutzung", nutzung),
            this.model.set("produkt", produkt),
            this.model.set("jahr", jahr),
            this.model.set("brwList", brwList);

            if (_.contains(params, true) === true) {
                this.show();
            }
            else {
                this.weiter();
            }
        },
        paramChanged: function (evt) {
            this.model.paramChanged(evt.target);
        },
        weiter: function () {
            new Seite4(this.model.get("params"), this.model.get("brwList"), this.model.get("nutzung"), this.model.get("produkt"), this.model.get("jahr"), this.model.get("lage"));
        },
        show: function () {
            this.model.calcDefaultsForTemplate();
            this.render();
            $("#seite_drei").show();
            $("#seite_zwei").hide();
            $("#seite_vier").hide();
            this.model.setInitialParams($("#requestedParamsListe"));
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            if (this.model.get("brwList").length > 0) {
                $("#StadtteilName").val(this.model.get("brwList")[0].brwLage.stadtteil);
                $("#StadtteilNameDiv").hide();
            }
        }
    });

    return Seite3View;
});
