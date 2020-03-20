import Template from "text-loader!./template.html";
import POIModel from "./model";
import "bootstrap/js/tab";
import "bootstrap/js/modal";

const POIView = Backbone.View.extend(/** @lends POIView.prototype */{
    events: {
        "click .glyphicon-remove": "hide",
        "click tr": "zoomFeature",
        "click li": "changedCategory"
    },

    /**
     * @class POIView
     * @memberof Controls.Orientation.Poi
     * @extends Backbone.View
     * @constructs
     * @fires Core#RadioTriggerUtilHideLoader
     * @fires Controls.Orientaion#RadioTriggerGeolocationRemoveOverlay
     * @listens Controls.Orientation.Poi#RadioTriggerPOIShowPOIModal
     * @listens Controls.Orientation.Poi#RadioTriggerPOIHidePOIModal
     */
    initialize: function () {
        const channel = Radio.channel("POI");

        this.model = POIModel;

        channel.on({
            "showPOIModal": this.show,
            "hidePOIModal": this.hide
        }, this);
    },

    id: "surrounding_vectorfeatures",

    className: "modal fade in poi",

    /**
     * @member Template
     * @description Template for modal to draw POIs
     * @memberof Controls.Orientation.Poi
     */
    template: _.template(Template),

    /**
     * Renders the POI modal.
     * @returns {void}
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },

    /**
     * Shows the modal.
     * @fires Core#RadioTriggerUtilHideLoader
     * @returns {void}
     */
    show: function () {
        this.model.calcInfos();
        this.render();

        this.$el.modal({
            backdrop: true,
            show: true
        });
        Radio.trigger("Util", "hideLoader");
    },

    /**
     * Hides the modal.
     * @fires Controls.Orientaion#RadioTriggerGeolocationRemoveOverlay
     * @returns {void}
     */
    hide: function () {
        this.$el.modal("hide");
        this.model.reset();
        Radio.trigger("geolocation", "removeOverlay");
    },

    /**
     * Zooms to a feature and start hide modal function.
     * @param {event} evt - click event.
     * @returns {void}
     */
    zoomFeature: function (evt) {
        this.model.zoomFeature(evt.currentTarget.id);
        this.hide();
    },

    /**
     * Changed the category for Features
     * @param {event} evt - Click event.
     * @returns {void}
     */
    changedCategory: function (evt) {
        const a = this.$(evt.currentTarget).children("a")[0],
            cat = this.$(a).attr("aria-controls");

        this.model.setActiveCategory(parseFloat(cat));
    }
});

export default POIView;
