import Template from "text-loader!./template.html";
import Model from "./model";

const LanguageView = Backbone.View.extend(/** @lends LanguageView.prototype */{
    events: {
        "change select": "changeLanguage"
    },
    /**
     * @class LanguageView
     * @extends Backbone.View
     * @memberof language
     * @constructs
     * @listens Title#RadioTriggerTitleSetSize
     */
    initialize: function () {
        this.model = new Model();

        this.render();
    },
    className: "language-switch",
    id: "languagebar",
    template: _.template(Template),
    /**
     * Render function for title.
     * @returns {void}
     */
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        $("#searchbar").after(this.$el);

        return this;
    },

    /**
     * change the language when one option is selected
     * @param {evt} evt - current selected value of option
     * @returns {void}
     */
    changeLanguage: function (evt) {
        this.$el.find("#languagebar :selected").unbind("click");
        i18next.changeLanguage(evt.currentTarget.value);
    }
});

export default LanguageView;
