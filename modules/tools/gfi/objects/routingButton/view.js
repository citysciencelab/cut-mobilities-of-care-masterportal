define(function (require) {

    var Backbone = require("backbone"),
        RoutingButtonTemplate = require("text!modules/tools/gfi/objects/routingButton/template.html"),
        RoutingButtonModel = require("modules/tools/gfi/objects/routingButton/model"),
        RoutingButtonView;

    RoutingButtonView = Backbone.View.extend({
        model: new RoutingButtonModel(),
        template: _.template(RoutingButtonTemplate),
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        events: {
            "click": "setZielpunkt"
        },

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },

        setZielpunkt: function () {
            this.model.setRoutingDestination();
        }
    });

    return RoutingButtonView;
});
