define([
    "underscore",
    "backbone",
    "eventbus"
], function (_, Backbone, EventBus) {
    "use strict";
    var restService = Backbone.Model.extend({
        defaults: {

        },
        initialize: function () {

        }
    });
    return restService;
});
