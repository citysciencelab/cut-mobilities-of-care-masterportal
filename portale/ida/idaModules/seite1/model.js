define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var Seite1Model = Backbone.Model.extend({
        defaults: {
            jahr: "",
            nutzung: "",
            produkt: "",
            lage: {}
        },
        initialize: function () {
            EventBus.on("seite1_lage:newLage", this.setLage, this);

            EventBus.on("seite1_jahr:newJahr", this.setJahr, this);

            EventBus.on("seite1_nutzung:newNutzung", this.setNutzung, this);

            EventBus.on("seite1_produkt:newProdukt", this.newProdukt, this);
        },
        setJahr: function (val) {
            this.set("jahr", val);
            this.checkParameter();
        },
        setNutzung: function (val) {
            this.set("nutzung", val);
            this.checkParameter();
        },
        newProdukt: function (val) {
            this.set("produkt", val);
            this.checkParameter();
        },
        setLage: function (val) {
            this.set("lage", val);
            this.checkParameter();
        },
        checkParameter: function () {
            console.log('checkParameter');
        }
    });

    return new Seite1Model();
});
