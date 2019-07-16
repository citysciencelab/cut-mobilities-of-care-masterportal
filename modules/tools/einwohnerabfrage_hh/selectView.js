import SnippetDropdownView from "../../snippets/dropdown/view";
import ResultView from "./resultView";
import Template from "text-loader!./selectTemplate.html";
import SnippetCheckBoxView from "../../snippets/checkbox/view";
/**
 * @member Template
 * @description Template used to create the population tool
 * @memberof Tools.EinwohnerAbfrage_HH
 */
const SelectView = Backbone.View.extend(/** @lends SelectView.prototype */{
    events: {
        "change select": "createDrawInteraction"
    },
    /**
     * @class SelectView
     * @extends Backbone.View
     * @memberof Tools.EinwohnerAbfrage_HH
     * @constructs
     */
    initialize: function () {
        this.listenTo(this.model, {
            // ändert sich der Fensterstatus wird neu gezeichnet
            "change:isActive": this.render,
            "renderResult": this.renderResult
        });
        this.snippetDropdownView = new SnippetDropdownView({model: this.model.get("snippetDropdownModel")});
        this.checkBoxRaster = new SnippetCheckBoxView({model: this.model.get("checkBoxRaster")});
        this.checkBoxAddress = new SnippetCheckBoxView({model: this.model.get("checkBoxAddress")});
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    id: "einwohnerabfrage-tool",
    template: _.template(Template),
    snippetDropdownView: {},
    /**
     * renders the view
     * @param {object} model - EinwohnerAbfrage_HH Model
     * @param {boolean} value - Rückgabe eines Boolean
     * @returns {this} this
     */
    render: function (model, value) {
        var attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.$el.find(".dropdown").append(this.snippetDropdownView.render().el);
            this.$el.find(".checkbox").append(this.checkBoxRaster.render().el);
            this.$el.find(".checkbox").append(this.checkBoxAddress.render().el);

            this.delegateEvents();
        }
        else {
            this.model.reset();
            this.undelegateEvents();
        }
        return this;
    },
    /**
     * returns Results of population tool
     * @returns {void}
     */
    renderResult: function () {
        this.$el.find(".result").html("");
        this.$el.find(".result").append(new ResultView({model: this.model}).render().el);
    },
    /**
     * creates the draw interaction to draw in the map
     * @param {object} evt - Object of Event which has been fired
     * @returns {void}
     */
    createDrawInteraction: function (evt) {
        this.model.get("drawInteraction").setActive(false);
        this.model.createDrawInteraction(evt.target.value);
    }
});

export default SelectView;
