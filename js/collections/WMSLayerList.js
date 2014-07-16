define([
    'underscore',
    'backbone',
    'models/wmslayer',
    'config'
], function (_, Backbone, WMSLayer, Config) {

    var WMSLayerList = Backbone.Collection.extend({
        model: WMSLayer,
        url: Config.wmsLayerConf,
        initialize: function () {
            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    console.log('Service Request failure');
                },
                success: function (collection) {
                    var idArray = Config.wmsLayerIDs;
                    collection.filterById(idArray);
                }
            });
        },
        filterById: function (idArray) {
            return this.reset(_.map(idArray, function (model) {
                return this.get(model);
            }, this));
        },
        filterByFolder: function (value) {
            return this.where({treeFolder: value});
        }
    });

    return new WMSLayerList();
});