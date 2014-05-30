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
            gfiTitle: '',   // Die Ueberschrift
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
            EventBus.on('setGFIURLs', this.setGFIURLs, this);
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
        setGFIURLs: function (value) {
            this.set('gfiURLs', _.without(value, undefined));
        },
        /**
         *
         */
        setGFIPopup: function (value) {
            var gfiTitle = [], gfiContent = [], gfiURLs = this.get('gfiURLs'), i;
            
            for (i = 0; i < gfiURLs.length; i += 1) {
                $.ajax({
                    url: '../cgi-bin/proxy.cgi?url=' + encodeURIComponent(gfiURLs[i]),
                    async: false,
                    type: 'GET',
                    success: function (data, textStatus, jqXHR) {
                        try {
                            //console.log(data.getElementsByTagName('gml:featureMember')[0].childNodes[0].nextSibling);
                            //var test = data.getElementsByTagName('gml:featureMember')[0].childNodes[0].nextSibling;
                            //console.log(_.without(test.childNodes, '<TextNode textContent="\n ">'));
                            //console.log(test.childNodes.length);
                           //var tests = _.filter(test.childNodes, function (element) {if (element.nodeType === 1) return element});
                            //console.log(tests.childNodes.length);
                            //console.log(data.getElementsByTagName('gml:featureMember')[0].children[0]);
                            gfiTitle.push(data.getElementsByTagName('gml:featureMember')[0].childNodes[0].nextSibling.localName);
                            //gfiTitle.push(data.getElementsByTagName('gml:featureMember')[0].children[0].localName);
                            gfiContent.push(data.getElementsByTagName('gml:featureMember')[0].childNodes[0].nextSibling);

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
            console.log(gfiContent);
            this.set('gfiTitle', gfiTitle);
            this.set('gfiContent', gfiContent);
            this.set('gfiCounter', gfiTitle.length);
        }
    });

    return new GFIPopup();
});