import TemplateMobile from "text-loader!./templateMobile.html";
import "bootstrap/js/tab";
import "bootstrap/js/modal";
import store from "../../src/app-store";
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
        // The event is triggered when the modal is hidden
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
            "sync": this.render,
            "removeView": this.remove
        });
    },
    className: "modal fade layerinformation",
    template: _.template(TemplateMobile),
    /**
    * todo
    * @returns {*} returns this
    */
    render: function () {
        const attr = this.model.toJSON();

        if (this.model.get("isVisible")) {
            this.$el.html(this.template(attr));
            this.$el.modal("show");
            // is necessary, because the class needed by the legend and the legend does not exist
            setTimeout(() => {
                this.setLayerIdForLayerInfo();
            }, 400);
        }
        return this;
    },

    /**
     * Triggers the event to create layerinfo legend
     * @returns {void}
     */
    setLayerIdForLayerInfo: function () {
        store.dispatch("Legend/setLayerIdForLayerInfo", this.model.get("id"));
        store.dispatch("Legend/setLayerCounterIdForLayerInfo", Date.now());
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
