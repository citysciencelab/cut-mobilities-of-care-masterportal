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
            EventBus.trigger('addOverlay', this.get('gfiOverlay')); // listnener in map.js
            EventBus.on('setGFIParams', this.setGFIParams, this); // trigger in map.js
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
                var pContent;
                if (pFeatures.getProperties().features) {
                    var contentArray = [];
                    for (var i = 0; i < pFeatures.getProperties().features.length; i += 1) {
                        pValues = pFeatures.getProperties().features[i].getProperties();
                        var pContentArray = new Array;
                        // NOTE Attributes === 'showAll' vorher abfragen
                        _.each(pValues, function (value, key, list) {
                            if (typeof value === 'string') { // Geometrie ist als Objekt in den Properties
                                if (_.has(attributes, key)) {
                                    pContentArray.push([attributes[key], value]);
                                }
                                else if (attributes === 'showAll') { // showAll
                                    key = key.substring(0, 1).toUpperCase() + key.substring(1).replace('_', ' ');
                                    pContentArray.push([key, value]);
                                }
                            }
                        });
                        pContent = _.object(pContentArray);
                        contentArray.push(pContent);
                    }
                    return contentArray;
                }
                else {
                    pValues = pFeatures.getProperties();
                    var pContentArray = new Array;
                    _.each(pValues, function (value, key, list) {
                        if (typeof value == 'string') {
                            if (_.has(attributes, key)) {
                                pContentArray.push([attributes[key], value]);
                            }
                            else if (attributes === 'showAll') { // showAll
                                key = key.substring(0, 1).toUpperCase() + key.substring(1).replace('_', ' ');
                                pContentArray.push([key, value]);
                            }
                        }
                    });
                    pContent = _.object(pContentArray);
                    return [pContent];
                }
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
                    try {
                        // ArcGIS
                        if (data.getElementsByTagName('FIELDS')[0] !== undefined) {
                            attr = data.getElementsByTagName('FIELDS')[0].attributes;
                            _.each(attr, function (element) {
                                if (params.attributes === 'showAll') {
                                    var attribute = element.localName.substring(0, 1).toUpperCase() + element.localName.substring(1).replace('_', ' ');
                                    gfi[attribute] = element.textContent.trim();
                                }
                                else {
                                    if (_.has(params.attributes, element.localName) === true) {
                                        gfi[params.attributes[element.localName]] = element.textContent.trim();
                                    }
                                }
                            });
                            pgfi.push(gfi);
                        }
                        // deegree
                        else if (data.getElementsByTagName('gml:featureMember')[0] !== undefined) {
                            nodeList = data.getElementsByTagName('gml:featureMember')[0].childNodes[0].nextSibling.childNodes;
                            if (params.attributes === 'showAll') {
                                attr = _.filter(nodeList, function (element) {
                                    return element.nodeType === 1;
                                });
                                _.each(attr, function (element) {
                                    var attribute = element.localName.substring(0, 1).toUpperCase() + element.localName.substring(1).replace('_', ' ');
                                    gfi[attribute] = element.textContent.trim();
                                });
                            }
                            else {
                                attr = _.filter(nodeList, function (element) {
                                    return element.nodeType === 1 && _.has(params.attributes, element.localName) === true;
                                });
                                _.each(attr, function (element) {
                                    gfi[params.attributes[element.localName]] = element.textContent.trim();
                                });
                            }
                            pgfi.push(gfi);
                        }
                        // deegree alle auf WebKit basierenden Browser (Chrome, Safari)
                        else if (data.getElementsByTagName('featureMember')[0] !== undefined) {
                            nodeList = data.getElementsByTagName('featureMember')[0].childNodes[0].nextSibling.childNodes;
                            if (params.attributes === 'showAll') {
                                attr = _.filter(nodeList, function (element) {
                                    return element.nodeType === 1;
                                });
                                _.each(attr, function (element) {
                                    var attribute = element.localName.substring(0, 1).toUpperCase() + element.localName.substring(1).replace('_', ' ');
                                    gfi[attribute] = element.textContent.trim();
                                });
                            }
                            else {
                                attr = _.filter(nodeList, function (element) {
                                    return element.nodeType === 1 && _.has(params.attributes, element.localName) === true;
                                });
                                _.each(attr, function (element) {
                                    gfi[params.attributes[element.localName]] = element.textContent.trim();
                                });
                            }
                            pgfi.push(gfi);
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
