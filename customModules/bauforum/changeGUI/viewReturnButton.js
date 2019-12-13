import Template from "text-loader!./templateReturnButton.html";
import "./style.less";

const ViewReturnButton = Backbone.View.extend({

    /**
     * Initialize View
     * @param {Object} model the model for this view
     * @returns {void}
     */
    initialize: function (model) {
        this.model = model;
        this.render();
    },
    template: _.template(Template),
    className: "table-nav unselectable col-md-2",
    id: "table-returnOverview",
    /**
     * Adds an return to overview link on the left-hand side
     * @returns {this} this
     */
    render: function () {
        const attr = this.model.toJSON();

        $("#table-nav").prepend(this.$el.html(this.template(attr)));
        this.delegateEvents();
        return this;
    }
});

export default ViewReturnButton;
