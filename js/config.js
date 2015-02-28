/**
 * RequireJS configuration
 */

require.config({
    waitSeconds: 60,
    paths: {
        openlayers: '/components/OpenLayers-3.0.0/build/ol-debug',
        jquery: '/components/jQuery-2.0.3/jquery.min',
        underscore: '/components/underscore-1.6.0/underscore.min',
        backbone: '/components/backbone-1.1.2/backbone.min',
        text: '/components/require-2.1.11/plugins/text-2.0.10/text',
        bootstrap: '/components/bootstrap-3.1.1/js/bootstrap.min',
        proj4: '/components/proj4-2.2.1/dist/proj4',
        eventbus: 'EventBus',
        views: 'views',
        models: 'models',
        collections: 'collections',
        templates: '../templates'
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
