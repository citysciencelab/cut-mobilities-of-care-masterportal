/**
 * @description Control to reset map to initial state
 * @module TotalViewMapModel
 * @extends Backbone.Model
 */
const TotalViewMapModel = Backbone.Model.extend({
    defaults: {
    },
    setTotalView: function () {
        Radio.trigger("MapView", "resetView");
    }
});

export default TotalViewMapModel;
