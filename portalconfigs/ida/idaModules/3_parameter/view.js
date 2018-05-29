define(function (require) {
    var Backbone = require("backbone"),
        Model = require("idaModules/3_parameter/model"),
        Template = require("text!idaModules/3_parameter/template.html"),
        Seite4 = require("idaModules/4_overview/view"),
        Radio = require("backbone.radio"),
        ParameterView;

    ParameterView = Backbone.View.extend({
        id: "parameter",
        model: new Model(),
        template: _.template(Template),
        events: {
            "click #seite3_weiter": "weiter",
            "click #seite3_back": "zurueck",
            "change .param": "paramChanged",
            "keyup .param": "paramChanged",
            "change .floatValue": "floatChanged",
            "keyup .floatValue": "floatChanged",
            "change .waehrung": "waehrungChanged",
            "keyup .waehrung": "waehrungChanged",
            "click .btn-group": "buttonChanged"
        },
        initialize: function (lage, params, nutzung, produkt, brwList, jahr) {
            var channel = Radio.channel("ParameterView");

            channel.on({
                "show": this.show,
                "destroy": this.destroy
            }, this);

            Radio.trigger("Info", "setNavStatus", "navbar-3-parameter");

            this.model.set("lage", lage);
            this.model.set("requestedParams", params);
            this.model.set("nutzung", nutzung);
            this.model.set("produkt", produkt);
            this.model.set("jahr", jahr);
            this.model.set("brwList", brwList);
            this.model.set("params", {});

            this.listenTo(this.model, {"switchToInvalid": this.switchToInvalid});
            this.listenTo(this.model, {"switchToValid": this.switchToValid});

            if (_.contains(params, true) === true) {
                this.model.calcDefaultsForTemplate();
                this.render();
                this.setInitialParams();
            }
            else {
                this.weiter();
            }
        },
        /*
         * Behandlung einer Float mit Währung und Aufruf von paramChanged
         */
        waehrungChanged: function (evt) {
            var obj,
                id = $(evt.currentTarget).attr("id"),
                value = $(evt.currentTarget).val().replace(",", "."),
                minCheck = $(evt.currentTarget).attr("min") ? $(evt.currentTarget).attr("min") : null,
                maxCheck = $(evt.currentTarget).attr("max") ? $(evt.currentTarget).attr("max") : null,
                waehrung = $(evt.currentTarget.parentNode.children[1]).text();

            $("#" + id).val(value);
            obj = {
                id: id,
                value: value,
                type: "number",
                minCheck: minCheck,
                maxCheck: maxCheck,
                waehrung: waehrung
            };

            this.model.paramChanged(obj);
        },
        /*
         * Behandlung eines Button-Click und Aufruf von paramChanged
         */
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
                id: $(evt.currentTarget).attr("id"),
                value: $(evt.target).attr("value"),
                type: $(evt.target).attr("type"),
                minCheck: null,
                maxCheck: null,
                waehrung: null
            };

            this.model.paramChanged(obj);
        },
        /*
         * Behandlung einer normalen Float ohne Währung und Aufruf von paramChanged
         */
        floatChanged: function (evt) {
            var id = evt.target.id,
                obj,
                value = evt.target.value.replace(",", ".");

            $("#" + id).val(value);
            obj = {
                id: evt.currentTarget.id,
                value: value,
                type: evt.currentTarget.type,
                minCheck: evt.currentTarget.min ? evt.currentTarget.min : null,
                maxCheck: evt.currentTarget.max ? evt.currentTarget.max : null,
                waehrung: null
            };

            this.model.paramChanged(obj);
        },
        /*
         * Behandlung eines sonstigen Value, wie Dropdown auch auch Integer. Aufruf von paramChanged
         */
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
        switchToValid: function (id) {
            var hasError;

            $("#" + id).parent().removeClass("has-error");
            hasError = $("#requestedParamsListe").find(".has-error");

            if (hasError.length === 0) {
                $("#seite3_weiter").prop("disabled", false);
            }
        },
        switchToInvalid: function (id) {
            $("#" + id).parent().addClass("has-error");
            $("#seite3_weiter").prop("disabled", true);
        },
        weiter: function () {
            Radio.trigger("Alert", "alert:remove");
            new Seite4(this.model.get("params"), this.model.get("brwList"), this.model.get("nutzung"), this.model.get("produkt"), this.model.get("jahr"), this.model.get("lage"));
        },
        zurueck: function () {
            Radio.trigger("BRWView", "remove");
            Radio.trigger("QueriesView", "show");
            this.destroy();
        },
        destroy: function () {
            this.model.clear({silent: true});
            this.model.destroy();
            this.remove();
        },
        /**
         * Zeigt das div wieder an.
         * @event "Parameter", "show"
         */
        show: function () {
            Radio.trigger("Alert", "alert:remove");
            Radio.trigger("Info", "setNavStatus", "navbar-3-parameter");
            this.$el.show();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("#bodenrichtwerte").after(this.$el.html(this.template(attr)));
            $("#bodenrichtwerte").hide();
        },
        setInitialParams: function () {
            Radio.trigger("Alert", "alert:remove");
            _.each($("#requestedParamsListe").children(), function (par) {
                if ($(par.children[1]).is("div[class=input-group]") && $(par.children[1].children[0]).hasClass("waehrung")) {
                    this.model.paramChanged({
                        id: par.children[1].children[0].id,
                        value: par.children[1].children[0].value,
                        type: "number",
                        minCheck: par.children[1].children[0].min ? par.children[1].children[0].min : null,
                        maxCheck: par.children[1].children[0].max ? par.children[1].children[0].max : null,
                        waehrung: $(par.children[1].children[1]).text()
                    });
                }
                else if ($(par.children[1]).is("input[type=number]")) {
                    this.model.paramChanged({
                        id: $(par.children[1]).attr("id"),
                        value: $(par.children[1]).attr("value"),
                        type: "number",
                        minCheck: $(par.children[1]).attr("min") ? $(par.children[1]).attr("min") : null,
                        maxCheck: $(par.children[1]).attr("max") ? $(par.children[1]).attr("max") : null,
                        waehrung: null
                    });
                }
                else if ($(par.children[1]).is("select")) {
                    this.model.paramChanged({
                        id: $(par.children[1]).attr("id"),
                        value: $(par.children[1]).val(),
                        type: "select-one",
                        minCheck: null,
                        maxCheck: null,
                        waehrung: null
                    });
                    if ($(par).attr("id") === "StadtteilNameDiv" && $(par.children[1]).val() !== null) {
                        $(par).hide();
                    }
                }
                else if ($(par.children[1].children[0]).is("div[class=btn-group]")) {
                    this.model.paramChanged({
                        id: $(par.children[1].children[0]).attr("id"),
                        value: $(par.children[1].children[0]).find(".active").val(),
                        type: "button",
                        minCheck: null,
                        maxCheck: null,
                        waehrung: null
                    });
                }
                else if ($(par.children[1]).is("div[class=input-group]") && $(par.children[1].children[0]).attr("id") === "MEAN") {
                    this.model.paramChanged({
                        id: $(par.children[1].children[0]).attr("id"),
                        value: $(par.children[1].children[0]).attr("value"),
                        type: "number",
                        minCheck: $(par.children[1].children[0]).attr("min") ? $(par.children[1].children[0]).attr("min") : null,
                        maxCheck: $(par.children[1].children[0]).attr("max") ? $(par.children[1].children[0]).attr("max") : null,
                        waehrung: null
                    });
                    this.model.paramChanged({
                        id: $(par.children[1].children[2]).attr("id"),
                        value: $(par.children[1].children[2]).attr("value"),
                        type: "number",
                        minCheck: $(par.children[1].children[2]).attr("min") ? $(par.children[1].children[2]).attr("min") : null,
                        maxCheck: $(par.children[1].children[2]).attr("max") ? $(par.children[1].children[2]).attr("max") : null,
                        waehrung: null
                    });
                }
                else if ($(par.children[1]).is("div[class=input-group]") && $(par.children[1].children[0]).attr("id") === "WGFZ") {
                    this.model.paramChanged({
                        id: $(par.children[1].children[0]).attr("id"),
                        value: $(par.children[1].children[0]).attr("value"),
                        type: "number",
                        minCheck: $(par.children[1].children[0]).attr("min") ? $(par.children[1].children[0]).attr("min") : null,
                        maxCheck: $(par.children[1].children[0]).attr("max") ? $(par.children[1].children[0]).attr("max") : null,
                        waehrung: null
                    });
                }
                else {
                    Radio.trigger("Alert", "alert", {
                        text: "<strong>Der Parameter \"" + par + "\" konnte nicht automatisch übernommen werden.</strong> " +
                            "Bitte versuchen Sie es erneut.",
                        kategorie: "alert-danger"
                    });
                    console.error(par);
                }
            }, this);
        }
    });

    return ParameterView;
});
