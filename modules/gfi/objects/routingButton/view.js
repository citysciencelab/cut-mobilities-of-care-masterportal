define(function (require) {

    var Backbone = require ("backbone"),
        RoutingButtonTemplate = require("text!modules/gfipopup/gfiObjects/routable/template.html"),
        RoutingButtonModel = require("modules/gfi/objects/RoutingButton/model"),
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
        /**
        *
        */
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },
        /**
         * Fire Event zum setzen des Zielpunkts
         */
        setZielpunkt: function () {
            this.model.setRoutingDestination();
        }
    });

    return RoutingButtonView;
});
