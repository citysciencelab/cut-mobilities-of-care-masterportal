define([
    "jquery",
    "backbone",
    "idaModules/1_queries/model",
    "idaModules/2_brw/view",
    "idaModules/1_queries/locality/view",
    "idaModules/1_queries/year/view",
    "idaModules/1_queries/use/view",
    "idaModules/1_queries/product/view"
], function ($, Backbone, Model, Seite2) {
    "use strict";
    var QueriesView = Backbone.View.extend({
        el: "#seite_eins",
        model: Model,
        events: {
            "click #seite1_weiter": "weiter"
        },
        initialize: function () {
            this.listenTo(this.model, "change:jahr", this.checkParameter),
            this.listenTo(this.model, "change:nutzung", this.checkParameter),
            this.listenTo(this.model, "change:produkt", this.checkParameter),
            this.listenTo(this.model, "change:lage", this.checkParameter);

            this.model.reset();
        },
        weiter: function () {
            new Seite2(this.model.get("jahr"), this.model.get("nutzung"), this.model.get("produkt"), this.model.get("lage"));
        },
        checkParameter: function () {
            if (this.model.get("jahr") !== "" && this.model.get("nutzung") !== "" && this.model.get("produkt") !== "" && this.model.get("lage") !== "") {
                $("#seite1_weiter").prop("disabled", false);
            }
            else {
                $("#seite1_weiter").prop("disabled", true);
            }
        }
    });

    return new QueriesView;
});
