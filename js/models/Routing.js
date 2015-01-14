define([
    'underscore',
    'backbone',
    'eventbus',
    'config',
], function (_, Backbone, EventBus, Config) {

    var RoutingModel = Backbone.Model.extend({
        defaults: {
            routingday: '',
            routinghour: '',
            routingminute: ''
        },
        initialize: function () {
        }
    });

    return new RoutingModel();
});
