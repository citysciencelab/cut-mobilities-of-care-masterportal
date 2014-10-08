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
            gfiOverlay: new ol.Overlay({ element: $('#gfipopup')}), // ol.Overlay
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
            EventBus.trigger('addOverlay', this.get('gfiOverlay')); // listnener ist in map.js
            EventBus.on('setGFIParams', this.setGFIParams, this); // wird in map.js ausgelöst
        },
        /**
         * Vernichtet das Popup.
         */
        destroyPopup: function () {
            this.get('element').popover('destroy');
        },
        /**
         * Zeigt das Popup.
         */
        showPopup: function () {
            this.get('element').popover('show');
        },
        /**
         * params: [0] = Objekt mit name und url; [1] = Koordinate
         */
        setGFIParams: function (params) {
            // Anzeige der GFI und GF in alphabetischer Reihenfolge der Layernamen
            var sortedParams = _.sortBy(params[0], 'name');
            var pContent = [], pTitles = [], pURLs = [];
            for (i=0; i < sortedParams.length; i++) {
                if (sortedParams[i].typ === "WMS") {
                    gfiContent = this.setWMSPopupContent(sortedParams[i].url);
                }
                else if (sortedParams[i].typ === "WFS") {
                    gfiContent = this.setWFSPopupContent(sortedParams[i].source, params[1], sortedParams[i].scale);
                }
                if (gfiContent && typeof gfiContent == 'object') {
                    pContent.push(gfiContent);
                    pTitles.push(sortedParams[i].name);
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
                //this.set('coordinate', params[1]);
                this.set('gfiURLs', pURLs);
                this.get('gfiOverlay').setPosition(params[1]);
                this.set('gfiContent', pContent);
                this.set('gfiTitles', pTitles);
                this.set('gfiCounter', pContent.length);
                EventBus.trigger('render');
            }
        },
        /**
         *
         */
        setWFSPopupContent: function (pSource, pCoordinate, pScale) {
            var pFeatures = pSource.getClosestFeatureToCoordinate(pCoordinate);
            // 5 mm um Klickpunkt
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
                if (pFeatures.getProperties().features) {
                    pValues = pFeatures.getProperties().features[0].getProperties();
                }
                else {
                    pValues = pFeatures.getProperties();
                }
                var pContentArray = new Array;
                _.each(pValues, function (value, key, list) {
                    if (typeof value == 'string') {
                        pKey = key.replace('_', ' ');
                        pKeyArray = pKey.split(' ');
                        for (var i=0; i<pKeyArray.length; i++) {
                            pKeyArray[i] = pKeyArray[i].substring(0, 1).toUpperCase() + pKeyArray[i].substring(1);
                        }
                        pKey = pKeyArray.join(' ');
                        pContentArray.push([pKey, value]);
                    }
                });
                var pContent = _.object(pContentArray);
                return pContent;
            }
        },

        setWMSPopupContent: function (gfiURL) {
            var pgfi={};
            $.ajax({
                url: 'http://wscd0096/cgi-bin/proxy.cgi?url=' + encodeURIComponent(gfiURL),
                async: false,
                type: 'GET',
                context: this,  // das model
                success: function (data, textStatus, jqXHR) {
                    var attr, nodeList, gfi = {};
                    try {
                        // ArcGIS
                        if (data.getElementsByTagName('FIELDS')[0] !== undefined) {
                            attr = data.getElementsByTagName('FIELDS')[0].attributes;
                            _.each(attr, function (element) {
                                if (element.localName.search('SHP') === -1) {
                                    gfi[element.localName] = element.textContent.trim();
                                }
                            });
                            pgfi=gfi;
                        }
                        // deegree
                        else if (data.getElementsByTagName('gml:featureMember')[0] !== undefined) {
                            nodeList = data.getElementsByTagName('gml:featureMember')[0].childNodes[0].nextSibling.childNodes;
                            attr = _.filter(nodeList, function (element) {
                                return element.nodeType === 1;
                            });
                            _.each(attr, function (element) {
                                gfi[element.localName] = element.textContent.trim();
                            });
                            pgfi=gfi;
                        }
                        // deegree alle auf WebKit basierenden Browser (Chrome, Safari)
                        else if (data.getElementsByTagName('featureMember')[0] !== undefined) {
                            nodeList = data.getElementsByTagName('featureMember')[0].childNodes[0].nextSibling.childNodes;
                            attr = _.filter(nodeList, function (element) {
                                return element.nodeType === 1;
                            });
                            _.each(attr, function (element) {
                                gfi[element.localName] = element.textContent.trim();
                            });
                            pgfi=gfi;
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    //console.log('Ajax-Request ' + textStatus);
                }
            });
            return pgfi;
        }
    });

    return new GFIPopup();
});
