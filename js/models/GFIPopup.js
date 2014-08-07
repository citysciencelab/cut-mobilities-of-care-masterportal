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
        },
        /**
         * Wird aufgerufen wenn das Model erzeugt wird.
         */
        initialize: function () {
            this.listenTo(this, 'change:gfiURLs', this.setPopupContent);
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
            var
                titles = _.pluck(params[0], 'name'),
                urls = _.pluck(params[0], 'url'),
                coordinate = params[1];

            this.set('gfiTitles', titles);
            this.set('gfiURLs', urls);
            
            this.get('gfiOverlay').setPosition(coordinate);
            this.set('coordinate', coordinate);
        },
        /**
         *
         */
        setPopupContent: function () {
            var gfiContent = [], gfiTitles = [], gfiURLs = this.get('gfiURLs'), i;
            for (i = 0; i < gfiURLs.length; i += 1) {
                $.ajax({
                    url: 'http://wscd0096/cgi-bin/proxy.cgi?url=' + encodeURIComponent(gfiURLs[i]),
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
                                gfiContent.push(gfi);
                                gfiTitles.push(this.get('gfiTitles')[i]);
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
                                gfiContent.push(gfi);
                                gfiTitles.push(this.get('gfiTitles')[i]);
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
                                gfiContent.push(gfi);
                                gfiTitles.push(this.get('gfiTitles')[i]);
                            }
                        }
                        catch (error) {
                            console.log(error);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        //console.log(textStatus);
                        //console.log(errorThrown);
                    }
                });
            }
            this.set('gfiContent', gfiContent);
            this.set('gfiTitles', gfiTitles);
            this.set('gfiCounter', gfiContent.length);
        }
    });

    return new GFIPopup();
});