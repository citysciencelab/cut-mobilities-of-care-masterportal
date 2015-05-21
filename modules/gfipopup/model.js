define([
    'backbone',
    'eventbus',
    'openlayers',
    'config',
    "bootstrap/popover"
], function (Backbone, EventBus, ol, Config) {

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
        loadStreamingLibsAndStartStreaming: function () {
            if( !navigator.userAgent.match(/Android/i) || !navigator.userAgent.match(/webOS/i) || !navigator.userAgent.match(/iPhone/i) || !navigator.userAgent.match(/iPad/i)
               || !navigator.userAgent.match(/iPod/i) || !navigator.userAgent.match(/BlackBerry/i) || !navigator.userAgent.match(/Windows Phone/i)) {
                $("head").append($("<link rel='stylesheet' href='/libs/video-js/video-js.css' type='text/css' media='screen' />"));
                $.getScript("/libs/video-js/video.dev.js", function( data, textStatus, jqxhr ) {
                    videojs.options.flash.swf = "/libs/video-js/video-js.swf";
                    this.set('isStreamingLibLoaded', true);
                    this.starteStreaming(this.get('uniqueId'));
                }.bind(this));
            }
        },
        /**
         * Diese Funktion startet das Video unter der übergebenen id
         */
        starteStreaming: function(id) {
            if (document.getElementById(id)) {
                vjs(id, {"autoplay" : true, "preload":"auto", "children": {"controlBar": false}}, function(){
//                    console.log('loaded');
                });
            }
        },
        /**
         * Wird aufgerufen wenn das Model erzeugt wird.
         */
        initialize: function () {
            this.set('element', this.get('gfiOverlay').getElement());
            this.listenTo(this, 'change:isPopupVisible', this.sendGFIForPrint);
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
            this.unset('coordinate', {silent:true});
        },
        /**
         * Zeigt das Popup.
         */
        showPopup: function () {
            $('#popovermin').fadeOut(500, function() {
                $('#popovermin').remove();
            });
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
            else {
                EventBus.trigger('closeGFIParams', this);
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
            if (!pFeatures) {
                return;
            }
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
            var url, data;
            // Umwandeln der diensteAPI-URLs in lokale URL gemäß httpd.conf
            if (params.url.indexOf('http://WSCA0620.fhhnet.stadt.hamburg.de') != -1) {
                url = params.url.replace('http://WSCA0620.fhhnet.stadt.hamburg.de', '/wsca0620');
            }
            else if (params.url.indexOf('http://bsu-ims.fhhnet.stadt.hamburg.de') != -1) {
                url = params.url.replace('http://bsu-ims.fhhnet.stadt.hamburg.de', '/bsu-ims');
            }
            else if (params.url.indexOf('http://bsu-ims') != -1) {
                url = params.url.replace('http://bsu-ims', '/bsu-ims');
            }
            else if (params.url.indexOf('http://bsu-uio.fhhnet.stadt.hamburg.de') != -1) {
                url = params.url.replace('http://bsu-uio.fhhnet.stadt.hamburg.de', '/bsu-uio');
            }
            else if (params.url.indexOf('http://geofos.fhhnet.stadt.hamburg.de') != -1) {
                url = params.url.replace('http://geofos.fhhnet.stadt.hamburg.de', '/geofos');
            }
            else if (params.url.indexOf('http://geofos') != -1) {
                url = params.url.replace('http://geofos', '/geofos');
            }
            else if (params.url.indexOf('http://wscd0095') != -1) {
                url = params.url.replace('http://wscd0095', '/geofos');
            }
            else if (params.url.indexOf('http://hmbtg.geronimus.info') != -1) {
                url = params.url.replace('http://hmbtg.geronimus.info', '/hmbtg');
            }
            else if (params.url.indexOf('http://lgvfds01.fhhnet.stadt.hamburg.de') != -1) {
                url = params.url.replace('http://lgvfds01.fhhnet.stadt.hamburg.de', '/lgvfds01');
            }
            else if (params.url.indexOf('http://lgvfds02.fhhnet.stadt.hamburg.de') != -1) {
                url = params.url.replace('http://lgvfds02.fhhnet.stadt.hamburg.de', '/lgvfds02');
            }
            else if (params.url.indexOf('http://wsca0620.fhhnet.stadt.hamburg.de') != -1) {
                url = params.url.replace('http://wsca0620.fhhnet.stadt.hamburg.de', '/wsca0620');
            }
            else if (params.url.indexOf('http://geodienste-hamburg.de') != -1) {
                url = params.url.replace('http://geodienste-hamburg.de', '/geodienste-hamburg');
            }
            // Für B-Pläne wird Feature_Count auf 3 gesetzt
            if (params.name === "Festgestellte Bebauungspläne") {
                data = "FEATURE_COUNT=3";
            }
            else {
                data = '';
            }
            var pgfi = [];
            $.ajax({
                url: url,
                data: data,
                async: false,
                type: 'GET',
                context: this,  // das model
                success: function (data, textStatus, jqXHR) {
                    var attr, gfiList = [];
                    // ESRI
                    if (data.getElementsByTagName('FIELDS')[0] !== undefined) {
                        _.each(data.getElementsByTagName('FIELDS'), function (element) {
                            gfiList.push(element.attributes);
                        });
                        // gfiList.push(data.getElementsByTagName('FIELDS')[0].attributes);
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
                                    if (element.value && element.value !== "") {
                                        gfi[attribute] = element.value.trim();
                                    }
                                    else if (element.textContent && element.textContent !== "") {
                                        gfi[attribute] = element.textContent.trim();
                                    }
                                });
                            }
                            else {
                                _.each(params.attributes, function(value, key, list) {
                                    var node = _.find(element, function(node) {
                                        return node.localName === key;
                                    });
                                    if (node) {
                                        if ( node.value && node.value !== "" && node.value !== "Null") {
                                            var nodevalue = node.value.trim();
                                        }
                                        else if (node.textContent && node.textContent !== "" && node.textContent !== "Null") {
                                            var nodevalue = node.textContent.trim();
                                        }
                                        if (nodevalue) {
                                            var key = [];
                                            key.push(value);
                                            var val = [];
                                            val.push(nodevalue);
                                            var newgfi = _.object(key, val);
                                            gfi = _.extend(gfi, newgfi);
                                        }
                                    }
                                });
                            }
                            if (_.isEmpty(gfi) !== true) {
                                pgfi.push(gfi);
                            }
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
            var geom = new ol.geom.LineString(route.getCoordinates(), 'XYZ');
            var olFeature = new ol.Feature({
                geometry : geom,
                name : gesuchteRoute
            });
            var vectorlayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [olFeature],
                    projection: ol.proj.get("EPSG:25832")
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
        }
    });

    return new GFIPopup();
});
