// if (window.location.href.charAt(window.location.href.length-1) === '#') {
//     window.location.href = window.location.href.substr(0, window.location.href.length-2);
// }

define('app', ['jquery', 'config'], function($, Config) {
    'use strict';

    require([
        'config',
        'jquery'
    ], function(Config, $) {
        if (Config.allowParametricURL && Config.allowParametricURL === true) {
            require(['models/ParametricURL'], function(ParametricURL) {
                new ParametricURL();
                loadMap();
            });
        } else {
            loadMap();
        }
    });

    function loadMap() {
        require([
            'models/map',
            'config',
            'jquery'
        ], function(Map, Config, $) {
            new Map();
            if (typeof(Config.clickCounter) === 'object' && Config.clickCounter.enabled === true) {
                require(['modules/ClickCounter/view'], function(ClickCounterView) {
                    new ClickCounterView();
                });
            }

            if (Config.attributions && Config.attributions === true) {
                require(['views/AttributionView'], function(AttributionView) {
                    new AttributionView();
                });
            }

            if (Config.mouseHover && Config.mouseHover === true) {
                require(['views/MouseHoverPopupView'], function(MouseHoverPopupView) {
                    new MouseHoverPopupView();
                });
            }

            if (Config.scaleLine && Config.scaleLine === true) {
                require(['views/ScaleLineView'], function(ScaleLineView) {
                    new ScaleLineView();
                });
            }

            if (Config.menubar === true) {
                require(['views/MenubarView', 'views/ToggleButtonView', 'views/ZoomButtonsView'], function(MenubarView, ToggleButtonView, ZoomButtonsView) {
                    new MenubarView();
                    new ToggleButtonView();
                    new ZoomButtonsView();
                    require(['views/WindowView'], function(WindowView) {
                        new WindowView();
                    });
                    if (Config.menu.tools === true) {
                        if (Config.tools.coord === true) {
                            require(['views/CoordPopupView'], function(CoordPopupView) {
                                new CoordPopupView();
                            });
                        }
                        if (Config.tools.gfi === true) {
                            require(['views/GFIPopupView'], function(GFIPopupView) {
                                new GFIPopupView();
                            });
                        }
                        if (Config.tools.measure === true) {
                            require(['views/MeasureView'], function(MeasureView) {
                                new MeasureView();
                            });
                        }
                        if (Config.tools.draw === true) {
                            require(['views/DrawView'], function(DrawView) {
                                new DrawView();
                            });
                        }
                        if (Config.tools.print === true) {
                            require(['views/PrintView'], function(PrintView) {
                                new PrintView();
                            });
                        }
                        require(['views/ToolsView'], function(ToolsView) {
                            new ToolsView();
                        });
                    }
                    if (Config.menu.treeFilter === true) {
                        require(['views/TreeFilterView'], function(TreeFilterView) {
                            new TreeFilterView();
                        });
                    }
                    if (Config.menu.searchBar === true) {
                        require(['views/SearchbarView'], function(SearchbarView) {
                            new SearchbarView();
                        });
                    }
                    if (Config.menu.wfsFeatureFilter === true) {
                        require(['views/wfsFeatureFilterView'], function(WFSFeatureFilterView) {
                            new WFSFeatureFilterView();
                        });
                    }
                    if (Config.orientation === true) {
                        require(['views/OrientationView'], function(OrientationView) {
                            new OrientationView();
                        });
                    }
                    if (Config.poi === true) {
                        require(['views/PointOfInterestView', 'views/PointOfInterestListView'], function(PointOfInterestView, PointOfInterestListView) {
                            //new PointOfInterestView();
                            new PointOfInterestListView();
                        });
                    }
                    if (Config.menu.legend === true) {
                        require(['views/LegendView'], function(LegendView) {
                            new LegendView();
                        });
                    }
                    if (Config.menu.routing === true) {
                        require(['views/RoutingView'], function(RoutingView) {
                            new RoutingView();
                        });
                    }
                });

            }

            $(function() {
                $('#loader').hide();
            });

        });
    };
});
