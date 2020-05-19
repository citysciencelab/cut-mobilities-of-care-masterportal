import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../snippets/dropdown/view";
/**
 * @member Template
 * @description Template used to create the measure tool
 * @memberof Tools.Measure
 */
const MeasureView = Backbone.View.extend(/** @lends MeasureView.prototype */{
    events: {
        "click button.table-tool-measure-delete": "deleteFeatures",
        "click button.measure-delete": "deleteFeatures",
        "click .form-horizontal > .form-group-sm > .col-sm-12 > .glyphicon-question-sign": function () {
            Radio.trigger("QuickHelp", "showWindowHelp", "measure");
        }
    },
    /**
     * @class MeasureView
     * @extends Backbone.View
     * @memberof Tools.Measure
     * @constructs
     * @fires QuickHelp#RadioTriggerQuickHelpShowWindowHelp
     * @fires Core#RadioTriggerMapRemoveInteraction
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:currentLng": () => {
                this.render(this.model, this.model.get("isActive"));
            }
        });
        this.snippetDropdownViewGeometry = new SnippetDropdownView({model: this.model.get("snippetDropdownModelGeometry")});
        this.snippetDropdownViewUnit = new SnippetDropdownView({model: this.model.get("snippetDropdownModelUnit")});
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    template: _.template(Template),

    /**
     * renders the view
     * @param {object} model - Measure Model
     * @param {boolean} value - Rückgabe eines Boolean
     * @returns {this} this
     */
    render: function (model, value) {
        const attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.$el.find(".dropdown_geometry").append(this.snippetDropdownViewGeometry.render().el);
            this.$el.find(".dropdown_unit").append(this.snippetDropdownViewUnit.render().el);
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
            this.unregisterListener();
            this.removeIncompleteDrawing();
        }
        return this;
    },

    /**
     * deletes all geometries from the layer
     * @return {void}
     */
    deleteFeatures: function () {
        this.model.removeIncompleteDrawing();
        this.model.deleteFeatures();
    },

    /**
     * removes the last drawing if it has not been completed
     * @return {void}
     */
    removeIncompleteDrawing: function () {
        this.model.removeIncompleteDrawing();
    },

    /**
     * logs listeners to specific events
     * @fires Core#RadioTriggerMapRemoveInteraction
     * @returns {void}
     */
    unregisterListener: function () {
        this.model.unregisterPointerMoveListener(this.model);
        this.model.unregisterClickListener(this.model);
        Radio.trigger("Map", "removeInteraction", this.model.get("draw"));
    }
});

export default MeasureView;
