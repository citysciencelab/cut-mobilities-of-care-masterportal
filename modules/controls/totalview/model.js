const TotalViewMapModel = Backbone.Model.extend({
    defaults: {
    },
    setTotalView: function () {
        Radio.trigger("MapView", "resetView");
    }
});

export default TotalViewMapModel;
