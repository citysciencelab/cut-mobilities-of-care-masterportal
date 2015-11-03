define([
    "underscore",
    "backbone",
    "eventbus"
], function (_, Backbone, EventBus) {
    "use strict";
    var Seite1NutzungModel = Backbone.Model.extend({
        defaults: {
            nutzung: ""
        },
        initialize: function () {
        },
        setNutzung: function (val) {
            this.set("nutzung", val);
            EventBus.trigger("seite1_nutzung:newNutzung", val);
        }
    });

    return new Seite1NutzungModel();
});
