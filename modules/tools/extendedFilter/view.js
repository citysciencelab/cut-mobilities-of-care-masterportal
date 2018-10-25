import Template from "text-loader!./template.html";

const ExtendedFilterView = Backbone.View.extend({
    events: {
        "change #dropdown": "nextStep",
        "click .btn_remove": "removeAttrFromFilter",
        "click #btn_back": "previousStep"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        }, this); // Fenstermanagement
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    template: _.template(Template),
    removeAttrFromFilter: function (evt) {
        this.model.removeAttrFromFilter(evt);
        this.render(this.model, this.model.get("isActive"));
    },

    nextStep: function (evt) {
        this.model.nextStep(evt);
        this.render(this.model, this.model.get("isActive"));
    },
    previousStep: function (evt) {
        this.model.previousStep(evt);
        this.render(this.model, this.model.get("isActive"));
    },

    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    }
});

export default ExtendedFilterView;
