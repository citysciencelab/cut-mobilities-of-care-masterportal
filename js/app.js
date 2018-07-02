define("app", function (require) {
    var Config = require("config"),
        Alert = require("modules/alerting/view"),
        RestReaderList = require("modules/restReader/collection"),
        Autostarter = require("modules/core/autostarter"),
        Util = require("modules/core/util"),
        StyleList = require("modules/vectorStyle/list"),
        RawLayerList = require("modules/core/rawLayerList"),
        Preparser = require("modules/core/configLoader/preparser"),
        ParametricURL = require("modules/core/parametricURL"),
        CRS = require("modules/core/crs"),
        Map = require("modules/core/map"),
        WPS = require("modules/core/wps"),
        AddGeoJSON = require("modules/tools/addGeoJSON/model"),
        style,
        sbconfig;

    // RemoteInterface laden
    if (Config.remoteInterface && Config.remoteInterface === true) {
        require(["modules/remoteInterface/model"], function (RemoteInterface) {
            new RemoteInterface();
        });
    }
    // Core laden
    new Alert();
    new Autostarter();
    new Util();
    new StyleList();
    new RawLayerList();
    new Preparser();
    new ParametricURL();
    new CRS();
    new Map();
    new RestReaderList();
    new WPS();
    new AddGeoJSON();

    // Funktionalitäten laden

    // Browser Druck Modul
    require(["modules/functionalities/browserPrint/model"], function (BrowserPrintModel) {
        new BrowserPrintModel();
    });
    // Graph laden
    require(["modules/tools/graph/model"], function (GraphModel) {
        new GraphModel();
    });
    // Module laden
    require(["modules/wfsTransaction/model"], function (WFSTransactionModel) {
        new WFSTransactionModel();
    });

    require(["modules/menu/menuLoader"], function (MenuLoader) {
        new MenuLoader();
    });

    require(["modules/zoomToGeometry/model"], function (ZoomToGeometry) {
        new ZoomToGeometry();
    });

    if (Config.zoomtofeature) {
        require(["modules/zoomtofeature/model"], function (ZoomToFeature) {
            new ZoomToFeature();
        });
    }

    // load customModules from config
    if (Config.customModules) {
        _.each(Config.customModules, function (module) {
            require([module], function (CustomModule) {
                new CustomModule();
            });
        });
    }

    require(["modules/snippets/slider/view", "modules/snippets/slider/range/view", "modules/snippets/dropdown/view"], function (SliderView, SliderRangeView, DropdownView) {
        // new SliderView();
        // new SliderRangeView();
        new DropdownView();
    });
    require(["modules/layerinformation/model"], function (LayerinformationModel) {
        new LayerinformationModel();
    });

    if (Config.footer && Config.footer.visibility === true) {
        require(["modules/footer/view"], function (FooterView) {
            new FooterView();
        });
    }

    if (Config.clickCounter && Config.clickCounter.desktop && Config.clickCounter.desktop !== "" && Config.clickCounter.mobile && Config.clickCounter.mobile !== "") {
        require(["modules/ClickCounter/view"], function (ClickCounterView) {
            new ClickCounterView(Config.clickCounter.desktop, Config.clickCounter.mobile);
        });
    }

    if (Config.mouseHover) {
        require(["modules/mouseHover/view"], function (MouseHoverPopupView) {
            new MouseHoverPopupView();
        });
    }

    if (Config.quickHelp && Config.quickHelp === true) {
        require(["modules/quickhelp/view"], function (QuickHelpView) {
            new QuickHelpView();
        });
    }

    if (Config.scaleLine && Config.scaleLine === true) {
        require(["modules/scaleline/view"], function (ScaleLineView) {
            new ScaleLineView();
        });
    }

    require(["modules/window/view"], function (WindowView) {
        new WindowView();
    });
    // Module laden
    // Tools
    require(["modules/sidebar/view"], function (SidebarView) {
        var sidebarView = new SidebarView();

        _.each(Radio.request("Parser", "getItemsByAttributes", {type: "tool"}), function (tool) {
            switch (tool.id) {
                case "compareFeatures": {
                    require(["modules/tools/compareFeatures/view"], function (CompareFeaturesView) {
                        new CompareFeaturesView();
                    });
                    break;
                }
                case "einwohnerabfrage": {
                    require(["modules/tools/einwohnerabfrage_hh/selectView"], function (EinwohnerabfrageView) {
                        new EinwohnerabfrageView();
                    });
                    break;
                }
                case "animation": {
                    require(["modules/tools/animation/view"], function (AnimationView) {
                        new AnimationView();
                    });
                    break;
                }
                case "filter": {
                    require(["modules/tools/filter/view"], function (FilterView) {
                        new FilterView();
                    });
                    break;
                }
                case "schulwegrouting": {
                    require(["modules/tools/schulwegRouting_hh/view"], function (SchulwegRoutingView) {
                        new SchulwegRoutingView();
                    });
                    break;
                }
                case "gfi": {
                    require(["modules/tools/gfi/model"], function (GfiModel) {
                        new GfiModel();
                    });
                    break;
                }
                case "coord": {
                    require(["modules/tools/getCoord/view"], function (CoordPopupView) {
                        new CoordPopupView();
                    });
                    break;
                }
                case "measure": {
                    require(["modules/tools/measure/view"], function (MeasureView) {
                        new MeasureView();
                    });
                    break;
                }
                case "draw": {
                    require(["modules/tools/draw/view"], function (DrawView) {
                        new DrawView();
                    });
                    break;
                }
                case "print": {
                    require(["modules/tools/print/view"], function (PrintView) {
                        new PrintView();
                    });
                    break;
                }
                case "parcelSearch": {
                    require(["modules/tools/parcelSearch/view"], function (ParcelSearchView) {
                        new ParcelSearchView();
                    });
                    break;
                }
                case "searchByCoord": {
                    require(["modules/tools/searchByCoord/view"], function (SearchByCoordView) {
                        new SearchByCoordView();
                    });
                    break;
                }
                case "saveSelection": {
                    require(["modules/tools/saveSelection/view"], function (SaveSelectionView) {
                        new SaveSelectionView();
                    });
                    break;
                }
                case "kmlimport": {
                    require(["modules/tools/kmlimport/view"], function (ImportView) {
                        new ImportView();
                    });
                    break;
                }
                case "wfsFeatureFilter": {
                    require(["modules/wfsfeaturefilter/view"], function (WFSFeatureFilterView) {
                        new WFSFeatureFilterView();
                    });
                    break;
                }
                case "extendedFilter": {
                    require(["modules/tools/extendedFilter/view"], function (ExtendedFilterView) {
                        new ExtendedFilterView();
                    });
                    break;
                }
                case "treeFilter": {
                    require(["modules/treefilter/view"], function (TreeFilterView) {
                        new TreeFilterView();
                    });
                    break;
                }
                case "routing": {
                    require(["modules/viomRouting/view"], function (RoutingView) {
                        new RoutingView();
                    });
                    break;
                }
                case "contact": {
                    require(["modules/contact/view"], function (Contact) {
                        new Contact();
                    });
                    break;
                }
                case "addWMS": {
                    require(["modules/tools/addwms/view"], function (AddWMSView) {
                        new AddWMSView();
                    });
                    break;
                }
                case "featureLister": {
                    require(["modules/featurelister/view"], function (FeatureLister) {
                        new FeatureLister();
                    });
                    break;
                }
                case "formular": {
                    require(["modules/formular/view"], function (Formular) {
                        new Formular(tool.modelname);
                    });
                    break;
                }
                case "legend": {
                    require(["modules/legend/legendLoader"], function (LegendLoader) {
                        new LegendLoader();
                    });
                    break;
                }
                default: {
                    break;
                }
            }
        });
    });

    // controls
    style = Radio.request("Util", "getUiStyle");

    if (!style || style !== "SIMPLE") {
        require(["modules/controls/view"], function (ControlsView) {
            var controls = Radio.request("Parser", "getItemsByAttributes", {type: "control"}),
                controlsView = new ControlsView();


            _.each(controls, function (control) {
                var element;

                switch (control.id) {
                    case "zoom": {

                        if (control.attr === true) {

                            element = controlsView.addRowTR(control.id);

                            require(["modules/controls/zoom/view"], function (ZoomControlView) {
                                new ZoomControlView({el: element});
                            });
                        }
                        break;
                    }
                    case "orientation": {
                        element = controlsView.addRowTR(control.id);

                        require(["modules/controls/orientation/view"], function (OrientationView) {
                            new OrientationView({el: element});
                        });
                        break;
                    }
                    case "mousePosition": {
                        if (control.attr === true) {
                            element = controlsView.addRowBL(control.id);

                            require(["modules/controls/mousePosition/view"], function (MousePositionView) {
                                new MousePositionView({el: element});
                            });
                        }
                        break;
                    }
                    case "fullScreen": {
                        if (control.attr === true) {
                            element = controlsView.addRowTR(control.id);

                            require(["modules/controls/fullScreen/view"], function (FullScreenView) {
                                new FullScreenView({el: element});
                            });
                        }
                        break;
                    }
                    case "totalview": {
                        if (control.attr === true) {
                            require(["modules/controls/totalview/view"], function (TotalView) {
                                new TotalView();
                            });
                        }
                        break;
                    }
                    case "attributions": {
                        if (control.attr === true || typeof control.attr === "object") {
                            element = controlsView.addRowBR(control.id);

                            require(["modules/controls/attributions/view"], function (AttributionsView) {
                                new AttributionsView({el: element});
                            });
                        }
                        break;
                    }
                    case "overviewmap": {
                        if (control.attr === true || typeof control.attr === "object") {
                            element = controlsView.addRowBR(control.id);

                            require(["modules/controls/overviewmap/view"], function (OverviewmapView) {
                                new OverviewmapView({el: element});
                            });
                        }
                        break;
                    }
                    case "freeze": {
                        if (control.attr === true) {
                            element = controlsView.addRowTR(control.id);

                            require(["modules/controls/freeze/model"], function (FreezeModel) {
                                new FreezeModel({uiStyle: style, el: element});
                            });
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });
        });
    }

    require(["modules/mapMarker/view"], function (MapMarkerView) {
        new MapMarkerView();
    });

    sbconfig = Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"})[0].attr;

    if (sbconfig) {
        require(["modules/searchbar/view"], function (SearchbarView) {
            new SearchbarView(sbconfig);
            if (Radio.request("Parser", "getPortalConfig").PortalTitle || Radio.request("Parser", "getPortalConfig").portalTitle) {
                require(["modules/title/view"], function (TitleView) {
                    new TitleView();
                });
            }
        });
    }

    require(["modules/tools/styleWMS/view"], function (StyleWMSView) {
        new StyleWMSView();
    });

    require(["modules/highlightFeature/model"], function (HighlightFeature) {
        new HighlightFeature();
    });

    Radio.trigger("Util", "hideLoader");
});
