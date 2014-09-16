define([
    'underscore',
    'backbone',
    'models/wmslayer',
    'models/wfslayer',
    'config'
], function (_, Backbone, WMSLayer, WFSLayer, Config) {

    var LayerList = Backbone.Collection.extend({
        url: Config.layerConf,
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
        parse: function (response) {
            var idArray = Config.layerIDs;
            return _.filter(response, function (element) {
                if (_.contains(idArray, element.id)) {
                    return element;
                }
            });
        },
        initialize: function () {
            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    console.log('Service Request failure');
                },
                success: function (collection) {
                    console.log(collection);
                }
            });
        }
    });

    return new LayerList();
});
