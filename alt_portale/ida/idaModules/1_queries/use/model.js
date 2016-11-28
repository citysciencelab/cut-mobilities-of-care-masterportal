define([
    "underscore",
    "backbone",
    "eventbus"
], function (_, Backbone, EventBus) {
    "use strict";
    var UseModel = Backbone.Model.extend({
        defaults: {
            nutzung: ""
        },
        initialize: function () {
        },
        setNutzung: function (val) {
            this.set("nutzung", val);
            EventBus.trigger("seite1_nutzung:newNutzung", val);
            this.set("header", val);
        }
    });

    return new UseModel();
});
