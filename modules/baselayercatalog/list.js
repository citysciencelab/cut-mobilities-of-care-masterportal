define([
    "backbone",
    "modules/layer/list",
    "config"
], function (Backbone, LayerList, Config) {

    var List = Backbone.Collection.extend({
        initialize: function () {
            var baseLayerIDList = _.pluck(Config.baseLayerIDs, "id");

            _.each(baseLayerIDList, function (baseLayerID) {
                this.add(LayerList.findWhere({id: baseLayerID}));
            }, this);
        }
    });

    return new List();
});
