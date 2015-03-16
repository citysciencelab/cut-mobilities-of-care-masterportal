if (window.location.href.charAt(window.location.href.length-1) === '#') {
    window.location.href = window.location.href.substr(0, window.location.href.length-2);
}
    var locations = {
        portal : window.location.protocol + '//' + window.location.host + window.location.pathname,
        baseUrl : require.toUrl(''),
        host : window.location.protocol + '//' + window.location.host,
        fhhnet : false
    };

var fhhnetHosts = ["wscd0096","wscd0096.fhhnet.stadt.hamburg.de","wscd0095","wscd0095.fhhnet.stadt.hamburg.de","geofos","geofos.fhhnet.stadt.hamburg.de"];
for (var i = 0; i < fhhnetHosts.length; i++){
    if (location.host === fhhnetHosts[i]){
        locations.fhhnet = true;
    }
}

/*global require*/
require.config({
    waitSeconds: 60,
    paths: {
        openlayers: '/libs/OpenLayers-3.0.0/build/ol-debug',
        jquery: '/libs/jQuery-2.1.0/jquery.min',
        underscore: '/libs/underscore-1.6.0/underscore.min',
        backbone: '/libs/backbone-1.1.2/backbone.min',
        text: '/libs/require-2.1.11/plugins/text-2.0.10/text',
        bootstrap: '/libs/bootstrap-3.3.2/js/bootstrap.min',
        proj4: '/libs/proj4-2.2.1/dist/proj4',
        config: locations.portal + 'config',
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

require([
    'config',
    'jquery'
    ], function (Config, $) {

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

        if (Config.scaleLine && Config.scaleLine === true) {
            require(['views/ScaleLineView'], function (ScaleLineView) {
                new ScaleLineView();
            });
        }

        if (Config.menubar === true) {
            require(['views/MenubarView', 'views/ToggleButtonView', 'views/ZoomButtonsView'], function (MenubarView, ToggleButtonView, ZoomButtonsView) {
                new MenubarView();
                new ToggleButtonView();
                new ZoomButtonsView();
                require(['views/WindowView'], function (WindowView) {
                    new WindowView();
                });
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
                        require(['views/MeasureView'], function (MeasureView) {
                            new MeasureView();
                        });
                    }
                    if (Config.tools.draw === true) {
                        require(['views/DrawView'], function (DrawView) {
                            new DrawView();
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
                    require(['views/wfsFeatureFilterView'], function (WFSFeatureFilterView) {
                        new WFSFeatureFilterView();
                    });
                }
                if (Config.orientation === true) {
                    require(['views/OrientationView'], function (OrientationView) {
                        new OrientationView();
                    });
                }
                if (Config.poi === true) {
                    require(['views/PointOfInterestView', 'views/PointOfInterestListView'], function (PointOfInterestView, PointOfInterestListView) {
                        //new PointOfInterestView();
                        new PointOfInterestListView();
                    });
                }
                if (Config.menu.legend === true) {
                    require(['views/LegendView'], function (LegendView) {
                        new LegendView();
                    });
                }
                if (Config.menu.routing === true) {
                    require(['views/RoutingView'], function (RoutingView) {
                        new RoutingView();
                    });
                }
            });

        }
        $(function () {
            $('#loader').hide();
        });
    });
