define([
    'underscore',
    'backbone',
    'models/wmslayer',
    'models/wfslayer',
    'config'
], function (_, Backbone, WMSLayer, WFSLayer, Config) {

    var LayerList = Backbone.Collection.extend({
        model: function (attrs, options) {
            if (attrs.typ === 'WMS') {
                return new WMSLayer(attrs, options);
            }
            else if (attrs.typ === 'WFS') {
                return new WFSLayer(attrs, options);
            }
            else {
                console.log('Typ ' + attrs.typ + ' nicht in LayerList konfiguriert.');
            }
        },
        url: Config.layerConf,
        initialize: function () {
            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    console.log('Service Request failure');
                },
                success: function (collection) {
                    var idArray = Config.layerIDs;
                    collection.filterById(idArray);
                }
            });
        },
        filterById: function (idArray) {
            return this.reset(_.map(idArray, function (model) {
                return this.get(model);
            }, this));
        }
    });

    return new LayerList();
});
