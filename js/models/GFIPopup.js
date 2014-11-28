define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers'
], function (_, Backbone, EventBus, ol) {

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
            gfiURLs : [],
            gfiCounter: 0
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
            var gfiContent;
            // Anzeige der GFI und GF in alphabetischer Reihenfolge der Layernamen
            var sortedParams = _.sortBy(params[0], 'name');
            var pContent = [], pTitles = [], pURLs = [];
            for (var i=0; i < sortedParams.length; i+=1) {
                if (sortedParams[i].typ === "WMS") {
                    gfiContent = this.setWMSPopupContent(sortedParams[i]);
                }
                else if (sortedParams[i].typ === "WFS") {
                    gfiContent = this.setWFSPopupContent(sortedParams[i].source, params[1], sortedParams[i].scale, sortedParams[i].attributes);
                }
                if (gfiContent !== undefined) {
                    _.each(gfiContent, function (content) {
                        pContent.push(content);
                        pTitles.push(sortedParams[i].name);
                    });
                    if (sortedParams[i].url) {
                        pURLs.push(sortedParams[i].url);
                    }
                    else if (sortedParams[i].source.source_) {
                        pURLs.push(sortedParams[i].source.source_.format.featureType_);
                    }
                    else if (sortedParams[i].source){
                        pURLs.push(sortedParams[i].source.format.featureType_);
                    }
                }
            }
            if (pContent.length > 0) {
                this.set('gfiURLs', pURLs);
                this.get('gfiOverlay').setPosition(params[1]);
                this.set('gfiContent', pContent);
                this.set('gfiTitles', pTitles);
                this.set('gfiCounter', pContent.length);
                this.set('coordinate', params[1]);
            }
        },
        /**
         *
         */
        setWFSPopupContent: function (pSource, pCoordinate, pScale, attributes) {
            var pFeatures = pSource.getClosestFeatureToCoordinate(pCoordinate);
            // 5 mm um Klickpunkt forEachFeatureInExtent
            var pMaxDist = 0.005 * pScale;
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
                            keyArray.push(value);
                            var valArray = new Array();
                            valArray.push(key);
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
            var pgfi = [];
            $.ajax({
                url: 'http://wscd0096/cgi-bin/proxy.cgi?url=' + encodeURIComponent(params.url),
                async: false,
                type: 'GET',
                context: this,  // das model
                success: function (data, textStatus, jqXHR) {
                    var attr, nodeList, gfi = {};
                    // ESRI
                    if (data.getElementsByTagName('FIELDS')[0] !== undefined) {
                        nodeList = data.getElementsByTagName('FIELDS')[0].attributes;
                    }
                    // deegree
                    else if (data.getElementsByTagName('gml:featureMember')[0] !== undefined) {
                        nodeList = data.getElementsByTagName('gml:featureMember')[0].childNodes[0].nextSibling.childNodes;
                        nodeList = _.filter(nodeList, function (element) {
                            return element.nodeType === 1;
                        });
                    }
                    // deegree alle auf WebKit basierenden Browser (Chrome, Safari)
                    else if (data.getElementsByTagName('featureMember')[0] !== undefined) {
                        nodeList = data.getElementsByTagName('featureMember')[0].childNodes[0].nextSibling.childNodes;
                        nodeList = _.filter(nodeList, function (element) {
                            return element.nodeType === 1;
                        });
                    }
                    if (nodeList) {
                        if (params.attributes === 'showAll') {
                            _.each(nodeList, function (element) {
                                var attribute = element.localName.substring(0, 1).toUpperCase() + element.localName.substring(1).replace('_', ' ');
                                gfi[attribute] = element.textContent.trim();
                            });
                        }
                        else {
                            _.each(params.attributes, function(value, key, list) {
                                var nodevalue = _.find(nodeList, function(node) {
                                    return node.localName === key;
                                });
                                if (nodevalue) {
                                    nodevalue = nodevalue.textContent.trim();
                                    var key = new Array();
                                    key.push(value);
                                    var val = new Array();
                                    val.push(nodevalue);
                                    var newgfi = _.object(key, val);
                                    gfi = _.extend(gfi, newgfi);
                                }
                            });
                        }
                        pgfi.push(gfi);
                        console.log(pgfi);
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
        }
    });

    return new GFIPopup();
});
