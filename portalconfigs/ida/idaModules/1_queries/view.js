define(function (require) {
    require("bootstrap/collapse");

    var Backbone = require("backbone"),
        Template = require("text!idaModules/1_queries/template.html"),
        QueriesModel = require("idaModules/1_queries/model"),
        Seite2 = require("idaModules/2_brw/view"),
        Locality = require("idaModules/1_queries/locality/view"),
        Year = require("idaModules/1_queries/year/view"),
        Use = require("idaModules/1_queries/use/view"),
        Product = require("idaModules/1_queries/product/view"),
        BuildingLease = require("idaModules/1_queries/buildingLease/view"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        QueriesView;

    QueriesView = Backbone.View.extend({
        el: "#queries",
        model: new QueriesModel(),
        template: _.template(Template),
        events: {
            "click #seite1_weiter": "weiter",
            "click .panel": "panelClick"
        },
        initialize: function () {
            var channel = Radio.channel("QueriesView");

            channel.on({
                "show": this.show
            }, this);

            this.listenTo(this.model, {
                "change:jahr": this.valueChanged,
                "change:nutzung": this.valueChanged,
                "change:produkt": this.valueChanged,
                "change:lage": this.valueChanged,
                "change:erbbaurecht": this.valueChanged
            });

            this.model.reset();

            if (this.checkIsInternetOrDev() === true) {
                this.setConfirmation();
            }
            else {
                this.renderDiv();
            }
        },
        /*
        * checks if portal runs in "geoportal-hamburg.de" or "localhost"
        */
        checkIsInternetOrDev: function () {
            var url = window.location.href,
                isInternetOrDev = (url.search("geoportal-hamburg.de") !== -1 || url.search("localhost") !== -1) === true ? true : false;

            return isInternetOrDev;
        },
        setConfirmation: function () {
            var id = "datenschutz_alert";

            Radio.once("Alert", {
                "closed": function (divId) {
                    if (id === divId) {
                        this.renderDiv();
                    }
                }
            }, this);

            Radio.trigger("Alert", "alert", {
                id: id,
                text: "Mit Schließen dieses Fensters bestätige ich, die <a href='" + Config.contact.datenschutzerklaerung + "' target='_blank' class='alert-link'>Datenschutzerklärung</a> gelesen zu haben und mit der Verwendung der Daten im geschilderten Umfang einverstanden zu sein.",
                kategorie: "alert-info",
                position: "center-center"
            });
        },
        renderDiv: function () {
            Radio.trigger("Info", "setNavStatus", "navbar-1-queries");
            this.render();
            new Locality();
            new Year();
            new Use();
            new Product();
            new BuildingLease();
        },
        weiter: function () {
            Radio.trigger("Alert", "alert:remove");
            new Seite2(this.model.get("jahr"), this.model.get("nutzung"), this.model.get("produkt"), this.model.get("lage"), this.model.get("erbbaurecht"));
        },
        /**
         * Nach jeder Veränderung eines Eingabewertes startet diese Funktion die Subfunctions.
         */
        valueChanged: function () {
            this.setPrimaryPanel();
            this.checkParameter();
        },
        /**
         * Steuert die Sichtbarkeit des fehlenden Panels
         */
        setPrimaryPanel: function () {
            if (this.model.get("lage") === "") {
                this.panelPrimary("lage");
            }
            else if (this.model.get("jahr") === "") {
                this.panelPrimary("jahr");
            }
            else if (this.model.get("nutzung") === "") {
                this.panelPrimary("nutzung");
            }
            else {
                this.panelPrimary("produkt");
            }
        },
        /**
         * Steuert den Weiter-Button
         */
        checkParameter: function () {
            if (this.model.get("lage") !== "" && this.model.get("jahr") !== "" && this.model.get("nutzung") !== "" && this.model.get("produkt") !== "" && this.model.get("erbbaurecht") !== "") {
                $("#seite1_weiter").prop("disabled", false);
            }
            else {
                $("#seite1_weiter").prop("disabled", true);
            }
        },
        panelClick: function (evt) {
            this.panelPrimary(evt.currentTarget.id);
            evt.stopPropagation();
        },
        panelPrimary: function (id) {
            _.each(this.$el.find(".panel"), function (panel) {
                if (id === $(panel).attr("id")) {
                    if ($(panel).hasClass("panel-primary") === false) {
                        $(panel).addClass("panel-primary");
                        $(panel).removeClass("panel-default");
                    }
                    this.panelCollapse($(panel).children()[1].id, "show");
                }
                else {
                    if ($(panel).hasClass("panel-primary") !== false) {
                        $(panel).removeClass("panel-primary");
                        $(panel).addClass("panel-default");
                        this.panelCollapse($(panel).children()[1].id, "hide");
                    }
                }
            }, this);
        },
        panelCollapse: function (id, status) {
            $("#" + id).collapse(status);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },
        /**
         * zeigt div wieder an
         * @event "QueriesView", "show"
         */
        show: function () {
            Radio.trigger("Alert", "alert:remove");
            Radio.trigger("Info", "setNavStatus", "navbar-1-queries");
            this.$el.show();
        }
    });

    return QueriesView;
});
