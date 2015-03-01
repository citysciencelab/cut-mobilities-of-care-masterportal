/**
 * RequireJS configuration
 */

require.config({
    waitSeconds: 60,
    paths: {
        jquery: '../components/jquery/dist/jquery',
        underscore: '../components/underscore/underscore',
        backbone: '../components/backbone/backbone',
        text: '../components/requirejs-text/text',
        bootstrap: '../components/bootstrap/dist/js/bootstrap',
        proj4: '../components/proj4/dist/proj4',
        eventbus: '../js/EventBus',
        views: '../js/views',
        models: '../js/models',
        collections: '../js/collections'
    },

    shim: {
        bootstrap: {
            deps: ['jquery']
        },
        openlayers: {
            exports: 'ol'
        }
    },
    urlArgs: {
        'bust': Date.now()
    }
});
