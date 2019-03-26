const TotalViewMapModel = Backbone.Model.extend({
    defaults: {
    },
    setTotalView: function () {
        Radio.trigger("MapView", "resetView");
    },
    getButton: function () {
        var config = Radio.request("Parser", "getItemByAttributes", {id: "totalview"});

        return _.isUndefined(config) === false ? config.attr.glyphicon : config;
    },
    getTableButton: function () {
        var config = Radio.request("Parser", "getItemByAttributes", {id: "totalview"});

        return _.isUndefined(config) === false ? config.attr.tableGlyphicon : config;
    }
});

export default TotalViewMapModel;
