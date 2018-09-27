const TotalviewmapModel = Backbone.Model.extend({
    defaults: {
    },
    setTotalView: function () {
        Radio.trigger("MapView", "resetView");
    }
});

export default TotalviewmapModel;
