define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {
    "use strict";
    var Seite3Model = Backbone.Model.extend({
        defaults: {
            brwList: []
        },
        initialize: function () {
        }
    });

    return new Seite3Model();
});
