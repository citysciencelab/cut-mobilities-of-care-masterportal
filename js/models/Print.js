define([
    'underscore',
    'backbone',
    'eventbus',
    'openlayers',
    'config'
], function (_, Backbone, EventBus, ol, Config) {

    /**
     *
     */
    var Print = Backbone.Model.extend({
//        url: 'http://wscd0096/cgi-bin/proxy.cgi?url=http://wscd0096:8680/mapfish_print_2.0/pdf6/info.json',
        url: Config.proxyURL + "?url=" + Config.printURL,
        initialize: function () {
            // NOTE über config steuern
            this.set('currentMapScale', Config.view.scale);
            this.set('currentMapCenter', Config.view.center);

            // get print config
            this.fetch({
                cache: false,
                async: false
            });

            EventBus.on('togglePrintWin', this.togglePrintWin, this);

            EventBus.on('sendLayersForPrint', this.setLayerParams, this);
            EventBus.on('currentMapScale', this.setCurrentMapScale, this);
            EventBus.on('currentMapCenter', this.setCurrentMapCenter, this);
        },
        updatePrintPage: function () {
            EventBus.trigger('updatePrintPage', this.get('active'));
        },
        /**
         *
         */
        togglePrintWin: function () {
            $('#printWin').toggle();
            if($('#printWin').css('display') === 'block') {
                this.set('active', true);
            }
            else {
                this.set('active', false);
            }
        },
        /**
         *
         */
        setCurrentMapScale: function (scale) {
            this.set('currentMapScale', scale);
        },
        setCurrentMapCenter: function (center) {
            this.set('currentMapCenter', center);
        },
        /**
         *
         */
        getLayersForPrint: function () {
            EventBus.trigger('getLayersForPrint');
        },
        /**
         *
         */
        setLayerParams: function (layers) {
//            console.log(layers);
            var layersArray = [];
            _.each(layers, function (layer) {
//                console.log(layer.get('url'));
                layersArray.push({
                    type: layer.get('typ'),
                    layers: layer.get('layers').split(),
                    baseURL: layer.get('url'),
                    format: "image/png",
                    opacity: layer.get('opacity')
                });
            });
            this.set('layerParams', layersArray);
            this.setSPEC();
        },
        /**
         *
         */
        setSPEC: function () {
            var spec = {
                layout: $('#layoutField option:selected').html(),
                srs: "EPSG:25832",
                units: "m",
                outputFilename: "test",
                outputFormat: "pdf",
                layers: this.get('layerParams'),
                pages: [
                    {
                        center: this.get('currentMapCenter'),
                        scale:  $('#scaleField').val(),
                        dpi: 96,
                        mapTitle: 'test'
                    }
                ]
            };
            var jsonSpec = JSON.stringify(spec);
            $.ajax({
//                url: 'http://wscd0096/cgi-bin/proxy.cgi?url=' + this.get('createURL'),
                url: Config.proxyURL + "?url=" + this.get("createURL"),
                type: 'POST',
                data: jsonSpec,
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                },
                success: function (data) {
                    window.open(data.getURL);
                    $('#loader').hide();
                },
                error: function (err) {
                    $('#loader').hide();
//                    console.log(err);
                }
            });
        }
    });

    return new Print();
});
