define([
    "backbone",
    "eventbus",
    "idaModules/3_parameter/model",
    "text!idaModules/3_parameter/template.html",
    "idaModules/4_summary/view"
], function (Backbone, EventBus, Model, Template, Seite4) {
    "use strict";
    var ParameterView = Backbone.View.extend({
        el: "#seite_drei",
        model: Model,
        template: _.template(Template),
        events: {
            "click #seite3_weiter": "weiter",
            "change .param": "paramChanged",
            "change #WGFZ": "commaChanger",
            "change #FLAE": "commaChanger",
            "change #WOFL": "commaChanger",
            "change #EGFL": "commaChanger",
            "change #OGFL": "commaChanger",
            "change #WONKM": "commaChanger",
            "change #SONKM": "commaChanger",
            "change #JEZ": "commaChanger",
            "click .btn-group": "buttonChanged",
            "click .waehrung": "waehrungChanged",
            "change .waehrung": "waehrungChanged"
        },
        waehrungChanged: function (evt) {
            if (evt.target.type === "button") {
                $(evt.currentTarget).find("button").each(function () {
                    if ($(this).hasClass("active") === true) {
                        $(this).removeClass("active");
                    }
                    else {
                        $(this).addClass("active");
                        $(evt.currentTarget).find("span").text($(this).val());
                    }
                });
            }

            var obj = {
                id: evt.currentTarget.id,
                value: $(evt.currentTarget).find("input").val(),
                type: "number",
                minCheck: null,
                maxCheck: null,
                waehrung: $(evt.currentTarget).find(".active").val()
            };

            this.model.paramChanged(obj);
        },
        buttonChanged: function (evt) {
            $(evt.currentTarget).find("button").each(function () {
                if ($(this).hasClass("active") === true) {
                    $(this).removeClass("active");
                }
                else {
                    $(this).addClass("active");
                }
            });

            var obj = {
                id: evt.currentTarget.id,
                value: evt.target.value,
                type: evt.target.type,
                minCheck: null,
                maxCheck: null,
                waehrung: null
            };

            this.model.paramChanged(obj);
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
            this.listenTo(this.model, {"switchToInvalid": this.switchToInvalid});
            this.listenTo(this.model, {"switchToValid": this.switchToValid});

            if (_.contains(params, true) === true) {
                this.show();
            }
            else {
                this.weiter();
            }
        },
        switchToValid: function (id) {
            $("#" + id).parent().removeClass("has-error");
        },
        switchToInvalid: function (id) {
            $("#" + id).parent().addClass("has-error");
        },
        paramChanged: function (evt) {
            var obj = {
                id: evt.currentTarget.id,
                value: evt.currentTarget.value,
                type: evt.currentTarget.type,
                minCheck: evt.currentTarget.min ? evt.currentTarget.min : null,
                maxCheck: evt.currentTarget.max ? evt.currentTarget.max : null,
                waehrung: null
            };

            this.model.paramChanged(obj);
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

    return ParameterView;
});
