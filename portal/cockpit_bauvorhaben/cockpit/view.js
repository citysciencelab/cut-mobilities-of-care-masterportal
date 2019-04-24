import initializeCockpitModel from "../cockpit/model";
import Template from "text-loader!./template.html";
import "./style.less";

const CockpitView = Backbone.View.extend({
    events: {
    },
    /**
     * Initialize function
     * @returns {void}
     */
    initialize: function () {
        this.model = initializeCockpitModel();
        this.render(this.model, this.model.get("isActive"));
    },
    id: "cockpit_bauvorhaben",
    template: _.template(Template),
    /**
     * Todo
     * @param {initializeCockpitModel} model Todo
     * @param {Boolean} value Todo
     * @returns {CockpitView} - Todo
     */
    render: function (model, value) {
        if (value) {
            const attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true);
            this.delegateEvents();
        }
        else {
            this.$el.empty();
            Radio.trigger("Sidebar", "toggle", false);
            this.undelegateEvents();
        }
        return this;
    }
});

export default CockpitView;
