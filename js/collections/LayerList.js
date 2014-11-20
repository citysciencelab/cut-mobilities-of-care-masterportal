define([
    'underscore',
    'backbone',
    'models/wmslayer',
    'models/wfslayer',
    'models/grouplayer',
    'config',
    'eventbus'
], function (_, Backbone, WMSLayer, WFSLayer, GroupLayer, Config, EventBus) {

    var LayerList = Backbone.Collection.extend({
        url: Config.layerConf,
        model: function (attrs, options) {
            var newLayer;
            if (attrs.typ === 'WMS') {
                newLayer = new WMSLayer(attrs.dienst, options);
            }
            else if (attrs.typ === 'WFS') {
                newLayer = new WFSLayer(attrs.dienst, options);
            }
            else if (attrs.typ === 'GROUP') {
                newLayer = new GroupLayer(attrs, options);
            }
            newLayer.set('visibility', attrs.defaultVisibility);
            newLayer.get('layer').setVisible(attrs.defaultVisibility);
            return newLayer;
        },
        parse: function (response) {
            /* NOTE
             * die Response beinhaltet die Konfigurationen aus der json.
             * Die config.layerID werden durchlaufen und die passende Konfiguration
             * wird zwischengespeichert.
             * Im Falle von Gruppenlayern werden alle childlayer gesucht und in einem Array gesammelt.
             * Dieser Array wird dem RückgabeArray zugefügt.
             * Rückgabe als Array.
             */
            var idArray = Config.layerIDs;
            var dienstArray = new Array();
            _.each(idArray, function(layerdef, index, list) {
                /* NOTE
                 * Prüfung ob Eintrag in config.js einen Gruppenlayer beschreibt (id == Array)
                 */
                if (_.has(layerdef, 'id') && _.isArray(layerdef.id)) {
                     var returnValue = {
                         id: layerdef.id,
                         name: layerdef.name,
                         typ: 'GROUP',
                         defaultVisibility: layerdef.visible,
                         layerdefinitions: []
                    };
                    _.each(layerdef.id, function(childlayer, index, list) {
                        var dienst = _.findWhere(response, {id: childlayer});
                        if (dienst) {
                            returnValue.layerdefinitions.push({
                                id: childlayer,
                                dienst: dienst
                            });
                        }
                        else {
                            console.log ('LayerID ' + childlayer + ' nicht in JSON gefunden.');
                        }
                    });
                    if (returnValue.layerdefinitions.length > 0) {
                        dienstArray.push(returnValue);
                    }
                }
                else if (_.has(layerdef, 'id') && _.isString(layerdef.id)) {
                    var dienst = _.findWhere(response, {id: layerdef.id});
                    if (dienst) {
                        var returnValue = {
                            id: layerdef.id,
                            typ: dienst.typ,
                            defaultVisibility: layerdef.visible,
                            dienst: dienst
                        }
                        dienstArray.push(returnValue);
                    }
                    else {
                        console.log (layerdef.id + ' nicht in JSON gefunden');
                    }
                }
                else {
                    console.log ('Ungültige Layerdefinition in config.js');
                }



//                var dienst = _.findWhere(response, {id: layerdef.id});
//                if (dienst) {
//                    dienstArray.push(dienst);
//                }
//                else if (_.has(layerdef, 'layerIDs')) {
//                     var returnValue = {
//                         id: layerdef.id,
//                         name: layerdef.name,
//                         typ: 'GROUP',
//                         defaultVisibility: layerdef.visible,
//                         layerdefinitions: []
//                    }
//                    _.each(layerdef.layerIDs, function(childlayer, index, list) {
//                        var dienst = _.findWhere(response, {id: childlayer});
//                        if (dienst) {
//                            returnValue.layerdefinitions.push({
//                                id: childlayer,
//                                dienst: dienst
//                            });
//                        }
//                        else {
//                            console.error ('LayerID ' + childlayer + ' nicht in JSON gefunden.');
//                        }
//                    });
//                    if (returnValue.layerdefinitions.length > 0) {
//                        dienstArray.push(returnValue);
//                    }
//                }
//                else {
//                    console.log ('Layer nicht in JSON gefunden.');
//                    console.log (layerdef);
//                }
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
            EventBus.trigger('sendLayersForPrint', this.getVisibleWMSLayer());
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
