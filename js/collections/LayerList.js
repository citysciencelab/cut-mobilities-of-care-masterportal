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
            /* NOTE
             * die Response beinhaltet die Konfigurationen aus der json.
             * Die config.layerID werden durchlaufen und die passende Konfiguration
             * wird zwischengespeichert.
             * Rückgabe als Array.
             */
            var idArray = Config.layerIDs;
            var dienstArray = new Array();
            _.each(idArray, function(element, index, list) {
                var dienst = _.findWhere(response, {id: element});
                dienstArray.push(dienst);
            });
            return dienstArray;
        },
        initialize: function () {
            EventBus.on('getLayersForPrint', this.sendVisibleWMSLayer, this);
            EventBus.on('updateStyleByID', this.updateStyleByID, this);
            EventBus.on('getVisibleWFSLayer', this.sendVisibleWFSLayer, this);

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
        getVisibleWMSLayer: function () {
            return this.where({visibility: true, typ: "WMS"});
        },
        /**
         * Gibt alle Sichtbaren WFS-Layer zurück.
         *
         */
        getVisibleWFSLayer: function () {
            return this.where({visibility: true, typ: "WFS"});
        },
        /**
         *
         */
        sendVisibleWFSLayer: function () {
            EventBus.trigger('sendVisibleWFSLayer', this.getVisibleWFSLayer());
        },
        /**
         *
         */
        sendVisibleWMSLayer: function () {
            EventBus.trigger('layerForPrint', this.getVisibleWMSLayer());
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
