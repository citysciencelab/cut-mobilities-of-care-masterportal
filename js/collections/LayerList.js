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
        comparator: "index",
        model: function (attrs, options) {
            var newLayer;
            if (attrs.typ === 'WMS') {
                newLayer = new WMSLayer(attrs.dienst, attrs.styles, attrs.id, attrs.name, attrs.displayInTree, attrs.opacity);
            }
            else if (attrs.typ === 'WFS') {
                newLayer = new WFSLayer(attrs.dienst, '', attrs.id, attrs.name, attrs.displayInTree, attrs.opacity);
            }
            else if (attrs.typ === 'GROUP') {
                newLayer = new GroupLayer(attrs, '', attrs.id, attrs.name, attrs.displayInTree, attrs.opacity);
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
                // GRUPPENLAYER weil Array
                if (_.has(layerdef, 'id') && _.isArray(layerdef.id)) {
                    var layerdefs = new Array();
                    //Childlayerattributierung
                    _.each(layerdef.id, function(childlayer, index, list) {
                        var returnValue = returndienst(response, childlayer);
                        if (returnValue) {
                            layerdefs.push(returnValue);
                        }
                    });
                    // Gruppenlayerattributierung
                    if (layerdef.name && layerdef.name != '' && layerdef.name != 'nicht vorhanden') {
                        var layername = layerdef.name;
                    }
                    else {
                        var layername = returnValue[0].name;
                    }
                    if (!_.has(layerdef, 'visible') || layerdef.visible != true) {
                        layerdef.visible = false;
                    }
                    if (!_.has(layerdef, 'displayInTree') || layerdef.displayInTree != false) {
                        layerdef.displayInTree = true;
                    }
                    var returnValue = {
                         id: _.uniqueId('grouplayer_'),
                         name: layername,
                         displayInTree: layerdef.displayInTree,
                         typ: 'GROUP',
                         defaultVisibility: layerdef.visible,
                         layerdefinitions: layerdefs,
                         opacity:layerdef.opacity
                    };
                    if (returnValue.layerdefinitions.length > 0) {
                        dienstArray.push(returnValue);
                    }
                }
                //SINGLELAYER
                else if (_.has(layerdef, 'id') && _.isString(layerdef.id)) {
                    var returnValue = returndienst(response, layerdef, index);
                    if (returnValue)
                        dienstArray.push(returnValue);
                    }
            });
            return dienstArray;

            function returndienst (response, layerdef, index) {
                // NOTE falls die ID aus mehreren Layern besteht
                var layers = layerdef.id.split(',');
                var dienst = _.findWhere(response, {id: layers[0]});
                if (layerdef.styles && layerdef.styles != '') {
                    // var uniqueid = layerdef.id + '_' + layerdef.styles;
                    var uniqueid = layers[0] + '_' + layerdef.styles;
                }
                else {
                    // var uniqueid = layerdef.id;
                    var uniqueid = layers[0];
                }
                if (dienst) {
                    var layername;
                    if (!_.has(layerdef, 'visible') || layerdef.visible != true) {
                        layerdef.visible = false;
                    }
                    if (layerdef.name && layerdef.name != '' && layerdef.name != 'nicht vorhanden') {
                        layername = layerdef.name;
                    }
                    else if (layers.length > 1) {
                        layername = dienst.datasets[0].md_name;
                        var layerList = "";
                        _.each(layers, function (layer) {
                            var obj = _.findWhere(response, {id: layer});
                            layerList += "," + obj.layers;
                        });
                        dienst.layers = layerList.slice(1, layerList.length);
                    }
                    else {
                        layername = dienst.name;
                    }
                    if (!_.has(layerdef, 'displayInTree') || layerdef.displayInTree != false) {
                        layerdef.displayInTree = true;
                    }
                    if (!_.has(layerdef, 'opacity') ) {
                        layerdef.opacity = 0;
                    }
                    var returnValue = {
                        id: uniqueid,
                        name: layername,
                        displayInTree: layerdef.displayInTree,
                        typ: dienst.typ,
                        defaultVisibility: layerdef.visible,
                        dienst: dienst,
                        styles: layerdef.styles,
                        opacity: layerdef.opacity
                    };
                    return returnValue;
                }
                else {
                    alert(layerdef.id + ' nicht in JSON gefunden');
                    return null
                }
            }
        },
        initialize: function () {
            EventBus.on("getLayerByCategory", this.sendLayerByProperty, this);
            EventBus.on('getVisibleWMSLayer', this.sendVisibleWMSLayer, this);
            EventBus.on('updateStyleByID', this.updateStyleByID, this);
            EventBus.on('setVisible', this.setVisibleByID, this);
            EventBus.on('getVisibleWFSLayer', this.sendVisibleWFSLayer, this);
            EventBus.on('getVisibleWFSLayerPOI', this.sendVisibleWFSLayerPOI, this);
            EventBus.on('getAllVisibleLayer', this.sendAllVisibleLayer, this);
            this.listenTo(this, 'change:visibility', this.sendVisibleWFSLayer, this);
            this.listenTo(this, 'change:visibility', this.sendAllVisibleLayer, this);

            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    alert('Fehler beim Parsen ' + Config.layerConf);
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
         * Gibt alle Sichtbaren Layer zurück.
         *
         */
        getAllVisibleLayer: function () {
            return this.where({visibility: true});
        },

        getAllLayer: function () {
            return this.models;
        },

        /**
         * [getLayerByProperty description]
         * @param {[type]} key   [description]
         * @param {[type]} value [description]
         */
        getLayerByProperty: function (key, value) {
            return this.filter(function (model) {
                if (typeof model.get(key) === "object") {
                    return _.contains(model.get(key), value);
                }
                else {
                    // else noch nicht getestet
                    return model.get(key) === value;
                }
            });
        },
        sendLayerByProperty: function (key, value) {
            EventBus.trigger("sendLayerByProperty", this.getLayerByProperty(key, value));
        },
        /**
         * Aktualisiert den Style vom Layer mit SLD_BODY.
         * args[0] = id, args[1] = visibility(bool)
         */
        setVisibleByID: function (args) {
            this.get(args[0]).set('visibility', args[1]);
            this.get(args[0]).get('layer').setVisible(args[1]);
        },
        /**
         *
         */
        sendVisibleWFSLayer: function () {
            EventBus.trigger('sendVisibleWFSLayer', this.getVisibleWFSLayer());
        },
        sendVisibleWFSLayerPOI: function () {
            EventBus.trigger('sendVisibleWFSLayerPOI', this.getVisibleWFSLayer());
        },
        /**
         *
         */
        sendVisibleWMSLayer: function () {
            EventBus.trigger('layerForPrint', this.getVisibleWMSLayer());
        },
        /**
         *
         */
        sendAllVisibleLayer: function () {
            EventBus.trigger('sendAllVisibleLayer', this.getAllVisibleLayer());
        },
        /**
         * Aktualisiert den Style vom Layer mit SLD_BODY.
         * SLD_BODY wird hier gesetzt. Wird in Print.js für das Drucken von gefilterten Objekten gebraucht.
         * args[0] = id, args[1] = SLD_Body
         */
        updateStyleByID: function (args) {
            this.get(args[0]).get('source').updateParams({'SLD_BODY': args[1]});
            this.get(args[0]).set('SLDBody', args[1]);
        }
    });

    return new LayerList();
});
