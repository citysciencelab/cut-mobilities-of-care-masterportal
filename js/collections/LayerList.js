define([
    'underscore',
    'backbone',
    'models/wmslayer',
    'models/wfslayer',
    'config',
    'eventbus'
], function (_, Backbone, WMSLayer, WFSLayer, Config, EventBus) {

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
            EventBus.on('getLayersForPrint', this.printLayer, this);
            EventBus.on('updateStyleByID', this.updateStyleByID, this);

            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    console.log('Service Request failure');
                },
                success: function (collection) {
                    //console.log(collection);
                }
            });
        },
        /**
         * Gibt alle Sichtbaren Layer zurück.
         *
         */
        getVisibleLayer: function () {
            return this.where({visibility: true});
        },
        printLayer: function () {
            EventBus.trigger('sendLayersForPrint', this.getVisibleLayer());
        },
        /**
         * Aktualisiert den Style vom Layer mit SLD_BODY.
         * args[0] = id, args[1] = SLD_Body
         */
        updateStyleByID: function (args) {
            this.get(args[0]).get('source').updateParams({'SLD_BODY': args[1]});
        }
    });

    return new LayerList();
});
