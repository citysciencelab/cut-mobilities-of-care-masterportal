
/*global require*/
require.config({
    waitSeconds: 60,
    paths: {
        openlayers: 'http://wscd0096/libs/OpenLayers-3.0.0/build/ol-debug',
        jquery: 'http://wscd0096/libs/jQuery-2.0.3/jquery.min',
        underscore: 'http://wscd0096/libs/underscore-1.6.0/underscore.min',
        backbone: 'http://wscd0096/libs/backbone-1.1.2/backbone.min',
        text: 'http://wscd0096/libs/require-2.1.11/plugins/text-2.0.10/text',
        bootstrap: 'http://wscd0096/libs/bootstrap-3.1.1/js/bootstrap.min',
        proj4: 'http://wscd0096/libs/proj4-2.2.1/dist/proj4',
        config: 'config',
        eventbus: '../../js/EventBus',
        views: '../../js/views',
        models: '../../js/models',
        collections: '../../js/collections',
        templates: '../../templates'
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
    'jquery'
], function (Config, _){
    if (Config.allowParametricURL && Config.allowParametricURL === true) {
        require(['models/ParametricURL'], function (ParametricURL) {
            new ParametricURL();
        });
    }

    require(['models/map'], function (Map) {
        new Map();
    });

    if (Config.attributions && Config.attributions === true) {
        require(['views/AttributionView'], function (AttributionView) {
            new AttributionView();
        });
    }

    if (Config.mouseHover && Config.mouseHover === true) {
        require(['views/MouseHoverPopupView'], function (MouseHoverPopupView) {
            new MouseHoverPopupView();
        });
    }

    if (Config.menubar === true) {
        require(['views/MenubarView', 'views/ToggleButtonView'], function (MenubarView, ToggleButtonView) {
            new MenubarView();
            new ToggleButtonView();
            if (Config.menu.tools === true) {
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
                if (Config.tools.orientation === true) {
                    require(['views/OrientationView'], function (OrientationView) {
                        new OrientationView();
                    });
                }
                if (Config.tools.print === true) {
                    require(['views/PrintView'], function (PrintView) {
                        new PrintView();
                    });
                }
                require(['views/ToolsView'], function (ToolsView) {
                    new ToolsView();
                });
            }
            if (Config.menu.treeFilter === true) {
                require(['views/TreeFilterView'], function (TreeFilterView) {
                    new TreeFilterView();
                });
            }
            if (Config.menu.searchBar === true) {
                require(['views/SearchbarView'], function (SearchbarView) {
                    new SearchbarView();
                });
            }
            if (Config.menu.wfsFeatureFilter === true) {
                require(['views/wfsFeatureFilterView'], function (wfsFeatureFilterView) {
                    new wfsFeatureFilterView();
                });
            }
            if (Config.orientation === true) {
                require(['views/OrientationView'], function (OrientationView) {
                    new OrientationView();
                });
            }
            if (Config.poi === true) {
                require(['views/PointOfInterestView', 'views/PointOfInterestListView'], function (PointOfInterestView, PointOfInterestListView) {
//                    new PointOfInterestView();
                    new PointOfInterestListView();
                });
            }
            if (Config.menu.legend === true) {
                require(['views/LegendView'], function (LegendView) {
                    new LegendView();
                });
            }
        });
    }
    $(function () {
        $('#loader').hide();
    });
});
