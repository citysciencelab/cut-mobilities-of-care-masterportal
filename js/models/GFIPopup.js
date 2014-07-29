define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers'
], function (_, Backbone, EventBus, ol) {

    /**
     *
     */
    var GFIPopup = Backbone.Model.extend({
        /**
         * The defaults hash (or function) can be used to specify
         * the default attributes for your model.
         * When creating an instance of the model,
         * any unspecified attributes will be set to their default value.
         */
        defaults: {
            gfiOverlay: new ol.Overlay({ element: $('#gfipopup')}), // ol.Overlay
            coordinate: '', // Die Position vom Overlay auf der Karte
            element: '',    // Das DOM-Element für das Overlay
            gfiTitles: '',   // Die Ueberschrift
            gfiContent: '', // Der Inhalt
            gfiURLs: '',    // Die Request-URLs
            gfiCounter: ''  // Die Anzahl der GFI-Requests
        },
        /**
         * It will be invoked when the model is created.
         */
        initialize: function () {
            this.registerListener();
            this.set('element', this.get('gfiOverlay').getElement());
            EventBus.trigger('addOverlay', this.get('gfiOverlay'));
        },
        /**
         * Registriert die Listener.
         */
        registerListener: function () {
            this.listenTo(this, 'change:gfiURLs', this.setGFIPopup);
            EventBus.on('setGFIParams', this.setGFIParams, this);
            EventBus.on('setGFIPopupPosition', this.setPosition, this);
        },
        /**
         * Set the position for this overlay and the coordinate attribute
         */
        setPosition: function (coordinate) {
            this.get('gfiOverlay').setPosition(coordinate);
            this.set('coordinate', coordinate);
        },
        /**
         *
         */
        destroyPopup: function () {
            this.get('element').popover('destroy');
        },
        /**
         *
         */
        showPopup: function () {
            this.get('element').popover('show');
        },
        /**
         *
         */
        setGFIParams: function (params) {
            this.set('gfiURLs', _.pluck(params, 'url'));
            this.set('gfiTitles', _.pluck(params, 'name'));
        },
        /**
         *
         */
        setGFIPopup: function () {
            var gfiContent = [], gfiURLs = this.get('gfiURLs'), i;
            for (i = 0; i < gfiURLs.length; i += 1) {
                $.ajax({
                    url: 'http://wscd0096/cgi-bin/proxy.cgi?url=' + encodeURIComponent(gfiURLs[i]),
                    async: false,
                    type: 'GET',
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
                            }
                            // deegree
                            else if (data.getElementsByTagName('gml:featureMember')[0].childNodes[0].nextSibling !== undefined) {
                                nodeList = data.getElementsByTagName('gml:featureMember')[0].childNodes[0].nextSibling.childNodes;
                                attr = _.filter(nodeList, function (element) {
                                    return element.nodeType === 1;
                                });
                                _.each(attr, function (element) {
                                    gfi[element.localName] = element.textContent.trim();
                                });
                                gfiContent.push(gfi);
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
            this.set('gfiCounter', gfiContent.length);
        }
    });

    return new GFIPopup();
});