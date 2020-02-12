import ZoomControlTemplate from "text-loader!./template.html";
import ZoomControlModel from "./model";

const ZoomControlView = Backbone.View.extend(/** @lends ZoomControlView.prototype */{
    events: {
        "click .glyphicon-plus": "setZoomLevelUp",
        "click .glyphicon-minus": "setZoomLevelDown"
    },
    /**
     * @class ZoomControlView
     * @extends Backbone.View
     * @memberof Controls.Zoom
     * @constructs
     * @description This control gives the user an interface to zoom in and out of the map
     * @fires Map#RadioRequestMapGetMapMode
     * @fires MapView#RadioTriggerMapViewSetZoomLevelUp
     * @fires MapView#RadioTriggerMapViewSetZoomLevelDown
     * @fires ClickCounter#RadioTriggerClickCounterZoomChanged
     * @listens Map#RadioTriggerMapChange
     */
    initialize: function () {
        const channel = Radio.channel("Map");

        this.model = new ZoomControlModel();
        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;

                if (changed.zoomInText || changed.zoomOutText) {
                    this.render();
                }
            }
        });

        this.render();
        this.mapChange(Radio.request("Map", "getMapMode"));
        channel.on({
            "change": this.mapChange
        }, this);
    },
    /**
     * @member ZoomControlTemplate
     * @description Template used for the Zoom Buttons
     * @memberof Controls.Zoom
     */
    template: _.template(ZoomControlTemplate),

    /**
     * Render Function
     * @returns {ZoomControlView} - Returns itself
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },

    /**
     * Increases the zoom level in the map by 1
     * @fires MapView#RadioTriggerMapViewSetZoomLevelUp
     * @fires ClickCounter#RadioTriggerClickCounterZoomChanged
     * @returns {void}
     */
    setZoomLevelUp: function () {
        Radio.trigger("MapView", "setZoomLevelUp");
        Radio.trigger("ClickCounter", "zoomChanged");
    },

    /**
     * Decreases the zoom level in the map by 1
     * @fires MapView#RadioTriggerMapViewSetZoomLevelUp
     * @fires ClickCounter#RadioTriggerClickCounterZoomChanged
     * @returns {void}
     */
    setZoomLevelDown: function () {
        Radio.trigger("MapView", "setZoomLevelDown");
        Radio.trigger("ClickCounter", "zoomChanged");
    },

    /**
     * Shows zoom buttons if map is in 2d-mode.
     * Hides zoom buttons if map is in 3d-mode.
     * @param {String} map Mode of the map. Possible values are "2D" or "3D".
     * @returns {void}
     */
    mapChange: function (map) {
        if (map === "2D") {
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
    }
});

export default ZoomControlView;
