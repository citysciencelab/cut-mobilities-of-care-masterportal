/*global require*/
require.config({
    paths: {
        openlayers: 'http://wscd0096/libs/OpenLayers-3.0.0-beta.5/build/ol-whitespace',
        jquery: 'http://wscd0096/libs/jQuery-2.0.3/jquery.min',
        jquery_ui: 'http://wscd0096/libs/jquery-ui-1.10.4/js/jquery-ui-1.10.4.min',
        jquery_ui_touch: 'http://wscd0096/libs/jquery-ui-touch-punch-0.2.3/jquery-ui-touch-punch.min',
        underscore: 'http://wscd0096/libs/underscore-1.6.0/underscore.min',
        backbone: 'http://wscd0096/libs/backbone-1.1.2/backbone.min',
        text: 'http://wscd0096/libs/require-2.1.11/plugins/text-2.0.10/text',
        bootstrap: 'http://wscd0096/libs/bootstrap-3.1.1/js/bootstrap.min',
        proj4js: 'http://wscd0096/libs/proj4js-1.1.0/proj4js-compressed',
        config: 'config',
        eventbus: '../js/EventBus',
        views: '../js/views',
        models: '../js/models',
        collections: '../js/collections',
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

require([
    'config',
    'models/Map'
], function (Config, Map) {
    new Map();

    if (Config.menubar === true) {
        require(['views/MenubarView'], function (MenubarView) {
            new MenubarView();
            if (Config.menu.tools === true) {
                require(['views/ToolsView'], function (ToolsView) {
                    new ToolsView();
                    if (Config.tools.coord === true) {
                        require(['views/CoordPopupView'], function (CoordPopupView) {
                            new CoordPopupView();
                        });
                    }
                    if (Config.tools.gfi === true) {
                        require(['views/GFIPopupView'], function (GFIPopupView) {
                            new GFIPopupView();
                        });
                    }
                });
            }
            if (Config.menu.searchBar === true) {
                require(['views/SearchbarView'], function (SearchbarView) {
                    new SearchbarView();
                });
            }
        });
    }
});