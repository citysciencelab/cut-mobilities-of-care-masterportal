/*global require*/
require.config({
    paths: {
        openlayers: 'http://wscd0096/libs/OpenLayers-3.0.0/build/ol-debug',
        jquery: 'http://wscd0096/libs/jQuery-2.0.3/jquery.min',
        underscore: 'http://wscd0096/libs/underscore-1.6.0/underscore.min',
        backbone: 'http://wscd0096/libs/backbone-1.1.2/backbone.min',
        text: 'http://wscd0096/libs/require-2.1.11/plugins/text-2.0.10/text',
        bootstrap: 'http://wscd0096/libs/bootstrap-3.1.1/js/bootstrap.min',
        proj4: 'http://wscd0096/libs/proj4-2.2.1/dist/proj4',
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
    'models/Map',
    'jquery'
], function (Config, Map) {
    new Map();

    if (Config.menubar === true) {
        require(['views/MenubarView', 'views/ToggleButtonView'], function (MenubarView, ToggleButtonView) {
            new MenubarView();
            new ToggleButtonView();
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
                    if (Config.tools.measure === true) {
                        require(['views/MeasureModalView', 'views/MeasurePopupView'], function (MeasureModalView, MeasurePopupView) {
                            new MeasureModalView();
                            new MeasurePopupView();
                        });
                    }
                    if (Config.tools.print === true) {
                        require(['views/PrintView'], function (PrintView) {
                            new PrintView();
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
    $(function () {
        $('#loader').hide();
    });
});
