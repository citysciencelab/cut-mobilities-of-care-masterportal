import RoutingButtonTemplate from "text-loader!./template.html";
import RoutingButtonModel from "./model";

const RoutingButtonView = Backbone.View.extend({
    /**
     * Wird aufgerufen wenn die View erzeugt wird.
     */
    events: {
        "click": "setZielpunkt"
    },

    initialize: function () {
        this.render();
    },
    model: new RoutingButtonModel(),
    template: _.template(RoutingButtonTemplate),

    render: function () {
        this.$el.html(this.template());
        return this;
    },

    setZielpunkt: function () {
        this.model.setRoutingDestination();
    }
});

export default RoutingButtonView;
