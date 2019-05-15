import TemplateMobile from "text-loader!./templateMobile.html";
import ContentTemplate from "text-loader!../legend/content.html";
import "bootstrap/js/tab";
import "bootstrap/js/modal";
/**
 * @member LayerInformationTemplateMobile
 * @description Template used to create the layer information for mobile devices
 * @memberof LayerInformation
 */
/**
 * @member LayerInformationContentTemplate
 * @description Template used to create content of the layer information template
 * @memberof LayerInformation
 */
const LayerInformationViewMobile = Backbone.View.extend(/** @lends LayerInformationViewMobile.prototype */{
    events: {
        // Das Event wird ausgelöst, sobald das Modal verborgen ist
        "hidden.bs.modal": "setIsVisibleToFalse"
    },
    /**
     * @class LayerInformationViewMobile
     * @extends Backbone.View
     * @memberof LayerInformation
     * @constructs
     * @fires LayerInformation#RadioTriggerSetIsVisibleToFalse
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
    className: "modal fade layerinformation",
    template: _.template(TemplateMobile),
    contentTemplate: _.template(ContentTemplate),
    /**
    * todo
    * @returns {*} returns this
    */
    render: function () {
        var attr = this.model.toJSON();

        this.addContentHTML();
        this.$el.html(this.template(attr));
        this.$el.modal("show");
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
    * @returns {void}
    */
    setIsVisibleToFalse: function () {
        this.model.setIsVisible(false);
    }
});

export default LayerInformationViewMobile;
