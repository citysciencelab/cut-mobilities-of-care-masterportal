define([
    "underscore",
    "backbone"
], function (_, Backbone) {
    "use strict";
    var Seite1NutzungModel = Backbone.Model.extend({
        defaults: {
            nutzung: ""
        },
        initialize: function () {
        },
        setNutzung: function (val) {
            this.set("nutzung", val);
        }
    });

    return new Seite1NutzungModel();
});
