define(function (require) {
    require("bootstrap/tab");
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        TableModel = require("../table/model"),
        Template = require("text!../../../table/template.html"),
        View;

    View = Backbone.View.extend({
        id: "RefugeesTable",
        template: _.template(Template),
        model: new TableModel(),
        events: {
            "click button.close": "remove",
            "click td": "clickStandort",
            "mouseover td": "selectStandort",
            "mouseleave tbody": "deselectStandort"
        },
        initialize: function () {
            var name = Radio.request("ParametricURL", "getZoomToGeometry");

            this.listenTo(this.model, {
                "render": this.render
            });

            if (name === "ALL") {
                this.model.sortAllFeatures();
            }
            else if (name !== "") {
                this.model.filterFeaturesByBezirk(name);
            }
        },
        render: function () {
            var attr = this.model.toJSON();

            $(".lgv-container").after(this.$el.html(this.template(attr)));
            this.updateMap();
            this.scaleImages();
            this.delegateEvents();
        },

        /**
         * Reagiert auf Klick auf einen Standort
         */
         clickStandort: function (selected) {
            var id = $(selected.currentTarget).parent().prop("id");

            this.model.zoomStandort(id);
         },

        /**
         * Reagiert auf Mouseover in Tabelle und startet Function
         */
        selectStandort: function (selected) {
            var id = $(selected.currentTarget).parent().prop("id");

            this.model.selectStandort(id);
        },

        /**
         * Reagiert auf Mouseleave und deselektiert
         */
         deselectStandort: function () {
            this.model.deselectStandort();
         },

        /**
         * Aktualisiert die Map nachdem die Tabelle gezeichnet wurde
         */
        updateMap: function () {
            $(".lgv-container").css("height", "65%");
            // tree Höhe wird angepasst. Nach Merge mit mml evt. überflüssig
            $("ul#tree").css("max-height", $(".lgv-container").height() - 160);
            Radio.trigger("Map", "updateSize");
        },

        /**
         * Setzt die Größe der Images in Abhängigkeit der Anzahl der Plätze
         */
        scaleImages: function () {
            _.each(this.$el.find("tr"), function (tr) {
                var numberOfPlaetze = parseInt(this.$(tr).find("td:nth-child(4)").text(), 10),
                    img = this.$(tr).find("img");

                if (numberOfPlaetze === 0) {
                    img.height(30);
                }
                else if (numberOfPlaetze < 100) {
                    img.height(20);
                }
                else if (numberOfPlaetze >= 250) {
                    img.height(30);
                }
                else {
                    img.height(25);
                }
            });
        },
        /**
         * Enfernt die Tabelle aus dem DOM und aktualisiert die Map
         */
        remove: function () {
            Radio.trigger("ZoomToGeometry", "setIsRender", false);
            this.undelegateEvents();
            this.$el.remove();
            $(".lgv-container").css("height", "100%");
            Radio.trigger("MapView", "resetView");
            Radio.trigger("Map", "updateSize");
        }
    });

    return View;
});
