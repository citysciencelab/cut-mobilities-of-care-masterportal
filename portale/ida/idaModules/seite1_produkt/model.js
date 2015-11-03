define([
    "underscore",
    "backbone"
], function (_, Backbone) {
    "use strict";
    var Seite1NutzungModel = Backbone.Model.extend({
        defaults: {
            produkt: ""
        },
        initialize: function () {
        },
        setProdukt: function (val) {
            console.log(val);
            this.set("produkt", val);
        }
    });

    return new Seite1NutzungModel();
});
