define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {

    var LayerInformation = Backbone.Model.extend({

        initialize: function () {
            console.log(this);
        }

    });

    return LayerInformation;
});
