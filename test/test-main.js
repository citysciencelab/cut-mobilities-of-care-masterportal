(function () {
    'use strict';

    // Set the flag for test environment
    window.__test = {};

    // // Make async
    // window.__karma__.loaded = function () {};

    require.config({

        // Set baseUrl for Karma
        baseUrl: 'base',

        // Location of tests
        paths: {
            openlayers: '_libs/openlayers/js/ol.amd',
            jquery: 'components/jquery/dist/jquery',
            underscore: 'components/underscore/underscore',
            backbone: 'components/backbone/backbone',
            text: 'components/requirejs-text/text',
            bootstrap: 'components/bootstrap/dist/js/bootstrap',
            proj4: 'components/proj4/dist/proj4',
            views: 'js/views',
            models: 'js/models',
            collections: 'js/collections',
            config: 'test/test-config/portal-config',
            app: 'js/app'
        }
    });

    require([
        'test/specs/main.spec'
    ], window.__karma__.start);
}());
