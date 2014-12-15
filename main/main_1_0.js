/* Extrahieren der Pfade
* master = portal 2x nach oben auf wscd0096
* geoportal-hamburg = portal 1x nach oben + libs/lgvversion
*/
if (window.location.host === 'wscd0096') {
    var portal = window.location.href;
    var master = portal.substr(0, portal.lastIndexOf('/')).substr(0, portal.substr(0, portal.lastIndexOf('/')).lastIndexOf('/')).substr(0, portal.substr(0, portal.lastIndexOf('/')).substr(0, portal.substr(0, portal.lastIndexOf('/')).lastIndexOf('/')).lastIndexOf('/'));
}
else if(window.location.host === 'geoportal-hamburg.de') {
    var portal = window.location.href;
    var master = portal.substr(0, portal.lastIndexOf('/')).substr(0, portal.substr(0, portal.lastIndexOf('/')).lastIndexOf('/')) + '/libs/lgvtest';
}
var host = window.location.origin;
/*global require*/
require.config({
    waitSeconds: 60,
    paths: {
        openlayers: host + '/libs/OpenLayers-3.0.0/build/ol-debug',
        jquery: host + '/libs/jQuery-2.0.3/jquery.min',
        underscore: host + '/libs/underscore-1.6.0/underscore.min',
        backbone: host + '/libs/backbone-1.1.2/backbone.min',
        text: host + '/libs/require-2.1.11/plugins/text-2.0.10/text',
        bootstrap: host + '/libs/bootstrap-3.1.1/js/bootstrap.min',
        proj4: host + '/libs/proj4-2.2.1/dist/proj4',
        config: portal + 'config',
        eventbus: master + '/js/EventBus',
        views: master + '/js/views',
        models: master + '/js/models',
        collections: master + '/js/collections',
        templates: master + '/templates'
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
