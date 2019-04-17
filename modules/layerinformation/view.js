import Template from "text-loader!./template.html";
import ContentTemplate from "text-loader!../legend/content.html";
import "jquery-ui/ui/widgets/draggable";
import "bootstrap/js/tab";
/**
 * @member LayerInformationTemplate
 * @description Template used to create the layer information
 * @memberof LayerInformation
 */
/**
 * @member LayerInformationContentTemplate
 * @description Template used to create content of the layer information template
 * @memberof LayerInformation
 */
const LayerInformationView = Backbone.View.extend(/** @lends LayerInformationView.prototype */{
    events: {
        "click .glyphicon-remove": "hide"
    },
    /**
     * @class LayerInformationView
     * @extends Backbone.View
     * @memberof LayerInformation
     * @constructs
     * @fires LayerInformation#RadioTriggerHide
     * @fires Layer#RadioTriggerLayerSetLayerInfoChecked
     * @listens LayerInformation#RadioTriggerLayerInformationSync
     * @listens LayerInformation#RadioTriggerLayerInformationRemoveView
     */
    initialize: function () {
        this.listenTo(this.model, {
            // model.fetch() feuert das Event sync, sobald der Request erfoglreich war
            "sync": this.render,
            "removeView": this.remove
        });
    },
    id: "layerinformation-desktop",
    className: "layerinformation",
    template: _.template(Template),
    contentTemplate: _.template(ContentTemplate),
    /**
    * todo
    * @returns {*} returns this
    */
    render: function () {
        var attr = this.model.toJSON();

        this.addContentHTML();
        $("#map").append(this.$el.html(this.template(attr)));
        this.$el.draggable({
            containment: "#map",
            handle: ".header"
        });
        this.$el.show();
        return this;
    },
    /**
     * Adds the legend definition to the rendered HTML, this is needed by the template
     * @returns {void}
     */
    addContentHTML: function () {
        var legends = this.model.get("legend");

        _.each(legends.legend, function (legend) {
            legend.html = this.contentTemplate(legend);
        }, this);
    },
    /**
    * todo
    * @fires Layer#RadioTriggerLayerSetLayerInfoChecked
    * @returns {void}
    */
    hide: function () {
        Radio.trigger("Layer", "setLayerInfoChecked", false);
        this.$el.hide();
        this.model.setIsVisible(false);
    }
});

export default LayerInformationView;
