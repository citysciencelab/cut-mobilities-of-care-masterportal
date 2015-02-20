define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers',
    'config'
], function (_, Backbone, EventBus, ol, Config) {

    var GFIPopup = Backbone.Model.extend({
        /**
         * The defaults hash (or function) can be used to specify
         * the default attributes for your model.
         * When creating an instance of the model,
         * any unspecified attributes will be set to their default value.
         */
        defaults: {
            gfiOverlay: new ol.Overlay({ element: $('#gfipopup') }), // ol.Overlay
            gfiContent: [],
            gfiTitles : [],
            wfsCoordinate: [],
            gfiURLs : [],
            gfiCounter: 0,
            isCollapsed: false,
            isVisible: false,
            isStreamingLibLoaded: false
        },
        /**
         * Diese Funktion lädt die erforderlichen Scripte und CSS nur im Bedarfsfall, wenn ein Video
         * wiedergegeben werden soll.
         */
        loadStreamingLibs: function () {
            $("head").append($("<link rel='stylesheet' href='../../../libs/video-js/video-js.css' type='text/css' media='screen' />"));
            $.getScript( "../../../libs/video-js/video.dev.js", function( data, textStatus, jqxhr ) {
                videojs.options.flash.swf = "../../../libs/video-js/video-js.swf"
            });
        },
        /**
         * Wird aufgerufen wenn das Model erzeugt wird.
         */
        initialize: function () {
            this.set('element', this.get('gfiOverlay').getElement());
            this.listenTo(this, 'change:isPopupVisible', this.sendGFIForPrint);
            this.listenTo(this, 'change:isStreamingLibLoaded', this.loadStreamingLibs);
            EventBus.trigger('addOverlay', this.get('gfiOverlay')); // listnener in map.js
            EventBus.on('setGFIParams', this.setGFIParams, this); // trigger in map.js
//            EventBus.on('getGFIForPrint', this.sendGFIForPrint, this);
        },
        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
            this.get('element').popover('destroy');
            this.set('isPopupVisible', false);
        },
        /**
         * Zeigt das Popup.
         */
        showPopup: function () {
            this.get('element').popover('show');
            this.set('isPopupVisible', true);
        },
        /**
         * params: [0] = Objekt mit name und url; [1] = Koordinate
         */
        setGFIParams: function (params) {
            $('#loader').show();
            var gfiContent;
            this.set('wfsCoordinate', []);
            // Anzeige der GFI und GF in alphabetischer Reihenfolge der Layernamen
            var sortedParams = _.sortBy(params[0], 'name');
            var pContent = [], pTitles = [], pRoutables = [];
            for (var i=0; i < sortedParams.length; i+=1) {
                if (sortedParams[i].typ === "WMS") {
                    gfiContent = this.setWMSPopupContent(sortedParams[i]);
                    // console.log(gfiContent);
                }
                else if (sortedParams[i].typ === "WFS") {
                    gfiContent = this.setWFSPopupContent(sortedParams[i].source, sortedParams[i].style, params[1], sortedParams[i].scale, sortedParams[i].attributes);
                }
                if (gfiContent !== undefined) {
                    _.each(gfiContent, function (content) {
                        pContent.push(content);
                        pTitles.push(sortedParams[i].name);
                        // Nur wenn Config.menu.routing==true, werden die einzelnen Routable-Informationen ausgewertet und im Template abgefragt
                        if (Config.menu.routing && Config.menu.routing === true) {
                            pRoutables.push(sortedParams[i].routable);
                        }
                    });
                }
            }
            if (pContent.length > 0) {
                if (this.get('wfsCoordinate').length > 0) {
                    var position = this.get('wfsCoordinate');
                }
                else {
                    var position = params[1];
                }
                this.get('gfiOverlay').setPosition(position);
                this.set('gfiContent', pContent);
                this.set('gfiTitles', pTitles);
                this.set('gfiRoutables', pRoutables);
                this.set('gfiCounter', pContent.length);
                this.set('coordinate', position);
            }
            $('#loader').hide();
        },
        /**
         *
         */
        setWFSPopupContent: function (pSourceAllFeatures, pLayerStyle, pCoordinate, pScale, attributes) {
            // NOTE: Hier werden die Features auf ihre Sichtbarkeit untersucht, bevor das nächstgelegene Feature zurückgegeben wird
            var pSource = new ol.source.Vector;
            if (pLayerStyle) {
                pSource.addFeatures(pSourceAllFeatures.getFeatures());
            }
            else {
                pSource.addFeatures(_.filter(pSourceAllFeatures.getFeatures(), function (feature) {
                    if (feature.getStyle()) {
                        if (feature.getStyle()[0].image_.getSrc() != '../../img/blank.png') {
                            return feature;
                        }
                    }
                }));
            }
            var pFeatures = pSource.getClosestFeatureToCoordinate(pCoordinate);
            // 1 cm um Klickpunkt forEachFeatureInExtent
            var pMaxDist = 0.01 * pScale;
            var pExtent = pFeatures.getGeometry().getExtent();
            var pX = pCoordinate[0];
            var pY = pCoordinate[1];            
            var pMinX = pExtent[0] - pMaxDist;
            var pMaxX = pExtent[2] + pMaxDist;
            var pMinY = pExtent[1] - pMaxDist;
            var pMaxY = pExtent[3] + pMaxDist;
            if (pX < pMinX || pX > pMaxX || pY < pMinY || pY > pMaxY) {
                return;
            }
            else {
                this.set('wfsCoordinate', pFeatures.getGeometry().getFirstCoordinate());
                var pQueryFeatures = new Array();
                if (pFeatures.getProperties().features) {
                    _.each(pFeatures.getProperties().features, function(element, index, list) {
                        pQueryFeatures.push(element);
                    });
                }
                else {
                    pQueryFeatures.push(pFeatures);
                }

                var pgfi = [];
                _.each(pQueryFeatures, function (element, index, list) {
                    var gfi = {};
                    var pAttributes = element.getProperties();
                    if (attributes === 'showAll') {
                        _.each(pAttributes, function (value, key, list) {
                            var keyArray = new Array();
                            key = key.substring(0, 1).toUpperCase() + key.substring(1).replace('_', ' ');
                            keyArray.push(key);
                            var valArray = new Array();
                            if (_.isNumber(value) || _.isBoolean(value)) {
                                value = value.toString();
                            }
                            if (!value || !_.isString(value)) {
                                return;
                            }
                            valArray.push(value);
                            var newgfi = _.object(keyArray, valArray);
                            gfi = _.extend(gfi, newgfi);
                        });
                    }
                    else {
                        _.each(attributes, function(value, key, list) {
                            var pAttributeValue = _.values(_.pick(pAttributes, key))[0];
                            if (pAttributeValue) {
                                var key = new Array();
                                key.push(value);
                                var val = new Array();
                                val.push(pAttributeValue);
                                var newgfi = _.object(key, val);
                                gfi = _.extend(gfi, newgfi);
                            }
                        });
                    }
                    pgfi.push(gfi);
                });
                return pgfi;
            }
        },
        setWMSPopupContent: function (params) {
            var request;
            // Für B-Pläne wird Feature_Count auf 3 gesetzt
            if (params.name === "Festgestellte Bebauungspläne") {
                request = params.url + "&FEATURE_COUNT=3";
            }
            else {
                request =  params.url
            }
            var pgfi = [];
            $.ajax({
                url: Config.proxyURL + '?url=' + encodeURIComponent(request),
                async: false,
                type: 'GET',
                context: this,  // das model
                success: function (data, textStatus, jqXHR) {
                    var attr, gfiList = [];
                    // ESRI
                    if (data.getElementsByTagName('FIELDS')[0] !== undefined) {
                        gfiList.push(data.getElementsByTagName('FIELDS')[0].attributes);
                    }
                    // deegree
                    else if (data.getElementsByTagName('gml:featureMember')[0] !== undefined) {
                        _.each(data.getElementsByTagName('gml:featureMember'), function (element) {
                            var nodeList = element.childNodes[0].nextSibling.childNodes;
                            gfiList.push(_.filter(nodeList, function (element) {
                                return element.nodeType === 1;
                            }));
                        });
                    }
                    // deegree alle auf WebKit basierenden Browser (Chrome, Safari)
                    else if (data.getElementsByTagName('featureMember')[0] !== undefined) {
                        _.each(data.getElementsByTagName('featureMember'), function (element) {
                            var nodeList = element.childNodes[0].nextSibling.childNodes;
                            gfiList.push(_.filter(nodeList, function (element) {
                                return element.nodeType === 1;
                            }));
                        });
                    }
                    if (gfiList) {
                        _.each(gfiList, function (element) {
                            var gfi = {}
                            if (params.attributes === 'showAll') {
                                _.each(element, function (element) {
                                    var attribute = element.localName.substring(0, 1).toUpperCase() + element.localName.substring(1).replace('_', ' ');
                                    gfi[attribute] = element.textContent.trim();
                                });
                            }
                            else {
                                _.each(params.attributes, function(value, key, list) {
                                    var nodevalue = _.find(element, function(node) {
                                        return node.localName === key;
                                    });
                                    if (nodevalue) {
                                        nodevalue = nodevalue.textContent.trim();
                                        var key = [];
                                        key.push(value);
                                        var val = [];
                                        val.push(nodevalue);
                                        var newgfi = _.object(key, val);
                                        gfi = _.extend(gfi, newgfi);
                                    }
                                });
                            }
                            pgfi.push(gfi);
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert('Ajax-Request ' + textStatus);
                }
            });
            return pgfi;
        },
        sendGFIForPrint: function () {
            EventBus.trigger('gfiForPrint', [this.get('gfiContent')[0], this.get('isPopupVisible')]);
        },
        /**
         * Löscht die Route aus der Karte
         */
        clearRoute: function () {
            var map = this.get('map');
            if (!map) return;
            _.each(map.getLayers(), function (layer) {
                if (_.isArray(layer)) {
                    _.each(layer, function (childlayer) {
                        if (childlayer.id && childlayer.id == 'route') {
                             map.removeLayer(childlayer);
                        }
                    });
                }
            });
        },
        /**
         * zeigt die Route, die der Button im Feld Value benennt.
         */
        showRoute: function (gesuchteRoute) {
            // erzeuge neue Route
            var route = _.find(this.get('gfiContent')[0], function (value, key) {
                if (key == gesuchteRoute) {
                    return value;
                }
            });
            var newCoord = new Array();
            for (i=0; i < route.flatCoordinates.length; i = i + 3) {
                newCoord.push([
                    route.flatCoordinates[i],
                    route.flatCoordinates[i+1],
                    route.flatCoordinates[i+2]
                ]);
            }
            var olFeature = new ol.Feature({
                geometry : new ol.geom.LineString(newCoord, 'XYZ'),
                name : gesuchteRoute
            });
            var vectorlayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [olFeature]
                }),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'blue',
                        width: 5
                    })
                })
            });
            vectorlayer.id = 'route';
            this.get('map').addLayer(vectorlayer);
            EventBus.trigger('zoomToExtent', olFeature.getGeometry().getExtent());
        },
    });

    return new GFIPopup();
});
