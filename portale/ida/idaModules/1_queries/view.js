define([
    "jquery",
    "backbone",
    "text!idaModules/1_queries/template.html",
    "idaModules/1_queries/model",
    "idaModules/2_brw/view",
    "idaModules/1_queries/locality/view",
    "idaModules/1_queries/year/view",
    "idaModules/1_queries/use/view",
    "idaModules/1_queries/product/view",
    "bootstrap/collapse"
], function ($, Backbone, Template, Model, Seite2, Locality, Year, Use, Product) {
    "use strict";
    var QueriesView = Backbone.View.extend({
        el: "#queries",
        model: Model,
        template: _.template(Template),
        events: {
            "click #seite1_weiter": "weiter",
            "mouseover .panel": "panelMouseHover",
            "click .panel": "panelClick"
        },
        initialize: function () {
            this.listenTo(this.model, "change:jahr", this.checkParameter),
            this.listenTo(this.model, "change:nutzung", this.checkParameter),
            this.listenTo(this.model, "change:produkt", this.checkParameter),
            this.listenTo(this.model, "change:lage", this.checkParameter);

            this.model.reset();
            this.render();
            new Locality;
            new Year;
            new Use;
            new Product;
        },
        weiter: function () {
            new Seite2(this.model.get("jahr"), this.model.get("nutzung"), this.model.get("produkt"), this.model.get("lage"));
        },
        checkParameter: function () {
            $("#seite1_weiter").prop("disabled", true);
            if (this.model.get("lage") !== "") {
                this.panelPrimary("jahr");
                $("#jahresfeld").focus();
                if (this.model.get("jahr") !== "") {
                    this.panelPrimary("nutzung");
                    $("#nutzungdropdown").focus();
                    if (this.model.get("nutzung") !== "") {
                        this.panelPrimary("produkt");
                        $("#produktdropdown").focus();
                        if (this.model.get("produkt") !== "") {
                            $("#seite1_weiter").prop("disabled", false);
                        }
                    }
                }
            }
        },
        panelMouseHover: function (evt) {
            var targetId = evt.currentTarget.id;

            _.each(this.$el.find(".panel-default"), function (div) {
                var id = $(div).children()[1].id;

                if ($(div)[0].id === targetId) {
                    this.panelCollapse(id, "show");
                    this.nuker();
                }
                else {
                    this.panelCollapse(id, "hide");
                }
            }, this);
        },
        nuker: function () {
            setTimeout(function () {
                _.each(this.$el.find(".panel-default"), function (div) {
                    this.panelCollapse($(div).children()[1].id, "hide");
                }, this);
            }.bind(this), 10000);
        },
        panelClick: function (evt) {
            this.panelPrimary(evt.currentTarget.id);
            evt.stopPropagation();
        },
        panelPrimary: function (id) {
            _.each(this.$el.find(".panel-primary"), function (div) {
                $(div).removeClass("panel-primary");
                $(div).addClass("panel-default");
            }, this);
            _.each(this.$el.find("#" + id), function (div) {
                $(div).addClass("panel-primary");
                $(div).removeClass("panel-default");
                this.panelCollapse($("#" + id).children()[1].id, "show");
            }, this);
        },
        panelCollapse: function (id, status) {
            $("#" + id).collapse(status);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    });

    return new QueriesView;
});
