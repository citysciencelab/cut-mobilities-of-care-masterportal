const TotalViewMapModel = Backbone.Model.extend(/**@lends TotalViewMapModel.prototype */{
    defaults: {
    },
    /**
     * @class TotalViewMapModel
     * @extends Backbone.Model
     * @memberof Controls.TotalView
     * @constructs
     * @fires MapView#RadioTriggerMapViewResetView
     */
    initialize: {},
    /**
     * @ description Resets the MapView state
     * @fires MapView#RadioTriggerMapViewResetView
     * @returns {void}
     */
    setTotalView: function () {
        Radio.trigger("MapView", "resetView");
    }
});

export default TotalViewMapModel;
