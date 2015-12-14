define([
    "jquery",
    "backbone",
    "eventbus",
    "idaModules/seite1/model",
    "idaModules/seite2/view",
    "idaModules/seite1_lage/view",
    "idaModules/seite1_jahr/view",
    "idaModules/seite1_nutzung/view",
    "idaModules/seite1_produkt/view"
], function ($, Backbone, EventBus, Model, Seite2) {
    "use strict";
    var Seite1View = Backbone.View.extend({
        el: "#seite_eins",
        model: Model,
        events: {
            "click #seite1_weiter": "weiter"
        },
        initialize: function () {
            this.listenTo(this.model, "change:jahr", this.checkParameter),
            this.listenTo(this.model, "change:nutzung", this.checkParameter),
            this.listenTo(this.model, "change:produkt", this.checkParameter)
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

    return new Seite1View;
});
