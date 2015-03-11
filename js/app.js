// if (window.location.href.charAt(window.location.href.length-1) === '#') {
//     window.location.href = window.location.href.substr(0, window.location.href.length-2);
// }

define('app',
    ['jquery', 'config'], function ($, Config) {
    'use strict';

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
