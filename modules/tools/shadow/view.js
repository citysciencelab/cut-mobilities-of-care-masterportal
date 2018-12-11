import ShadowTemplate from "text-loader!./template.html";

const ShadowView = Backbone.View.extend({
    events: {
        "click .glyphicon-remove": "destroy",
        "click #toggleShadow": "toggleShadow",
        "click #back": "backwardTime",
        "click #forward": "forwardTime"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    toggleShadow: function () {
        this.model.toggleShadow();
    },
    forwardTime: function () {
        this.model.forwardTime();
    },
    backwardTime: function () {
        this.model.backwardTime();
    },
    template: _.template(ShadowTemplate),
    render: function (model, value) {
        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template({}));
        this.delegateEvents();
        return this;
    }
});

export default ShadowView;
