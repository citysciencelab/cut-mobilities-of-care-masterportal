import ResultTemplate from "text-loader!./resultTemplate.html";

const ResultView = Backbone.View.extend({
    /**
     * @class ContactView
     * @extends Backbone.View
     * @memberof Contact
     * @constructs
     * @listens ContactModel#changeIsActive
     * @listens ContactModel#changeInvalid
     */
    initialize: function () {
        this.template = _.template(ResultTemplate);

        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;

                // if one of the language properties changes, all other language properties changed too, so only check one of them
                if (changed.confidentialityHint) {
                    this.render();
                }
            }
        });

    },
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },
    model: {}
});

export default ResultView;
