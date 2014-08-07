/*global require*/
require.config({
    paths: {
        openlayers: 'http://wscd0096/libs/OpenLayers-3.0.0-gamma.2/build/ol-simple',
        jquery: 'http://wscd0096/libs/jQuery-2.0.3/jquery.min',
        underscore: 'http://wscd0096/libs/underscore-1.6.0/underscore.min',
        backbone: 'http://wscd0096/libs/backbone-1.1.2/backbone.min',
        text: 'http://wscd0096/libs/require-2.1.11/plugins/text-2.0.10/text',
        bootstrap: 'http://wscd0096/libs/bootstrap-3.1.1/js/bootstrap.min',
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