/* Extrahieren der Pfade
* master = portal 2x nach oben auf wscd0096
* geoportal-hamburg = portal 1x nach oben + libs/lgvversion
*/
if (window.location.href.charAt(window.location.href.length-1) === '#') {
    window.location.href = window.location.href.substr(0, window.location.href.length-2);
}
if (window.location.host === 'wscd0096') {
    var locations = {
        portal : window.location.href,
        master : window.location.href.substr(0, window.location.href.lastIndexOf('/')).substr(0, window.location.href.substr(0, window.location.href.lastIndexOf('/')).lastIndexOf('/')).substr(0, window.location.href.substr(0, window.location.href.lastIndexOf('/')).substr(0, window.location.href.substr(0, window.location.href.lastIndexOf('/')).lastIndexOf('/')).lastIndexOf('/')),
        host : window.location.origin
    };
}
else if(window.location.host === 'www.geoportal-hamburg.de' || window.location.host === 'geoportal-hamburg.de') {
    var locations = {
        portal : window.location.href,
        master : window.location.href.substr(0, window.location.href.lastIndexOf('/')).substr(0, window.location.href.substr(0, window.location.href.lastIndexOf('/')).lastIndexOf('/')) + '/libs/lgvtest',
        host : window.location.origin
    };
}
/*global require*/
require.config({
    waitSeconds: 60,
    paths: {
        openlayers: locations.host + '/libs/OpenLayers-3.0.0/build/ol-debug',
        jquery: locations.host + '/libs/jQuery-2.0.3/jquery.min',
        underscore: locations.host + '/libs/underscore-1.6.0/underscore.min',
        backbone: locations.host + '/libs/backbone-1.1.2/backbone.min',
        text: locations.host + '/libs/require-2.1.11/plugins/text-2.0.10/text',
        bootstrap: locations.host + '/libs/bootstrap-3.1.1/js/bootstrap.min',
        proj4: locations.host + '/libs/proj4-2.2.1/dist/proj4',
        config: locations.portal + 'config',
        eventbus: locations.master + '/js/EventBus',
        views: locations.master + '/js/views',
        models: locations.master + '/js/models',
        collections: locations.master + '/js/collections',
        templates: locations.master + '/templates'
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
