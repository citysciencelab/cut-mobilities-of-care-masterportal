require.config({
    waitSeconds: 60,
    paths: {
        openlayers: '../_libs/openlayers/js/ol.amd',
        jquery: '../components/jquery/dist/jquery',
        underscore: '../components/underscore/underscore',
        backbone: '../components/backbone/backbone',
        text: '../components/requirejs-text/text',
        bootstrap: '../components/bootstrap/dist/js/bootstrap',
        proj4: '../components/proj4/dist/proj4',
        eventbus: '../js/EventBus',
        views: '../js/views',
        models: '../js/models',
        collections: '../js/collections',
        config: '../test/test-config/portal-config',
        app: '../js/app'
    },

    shim: {
        bootstrap: {
            deps: ['jquery']
        }
    },
    urlArgs: 'bust=' +  (new Date()).getTime()
});

define('main',['app'], function (App) {
    console.log('Application initialized');
});
