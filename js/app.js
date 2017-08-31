define("app",
    [
    "jquery",
    "config",
    "modules/core/util",
    "modules/core/rawLayerList",
    "modules/restReader/collection",
    "modules/core/configLoader/preparser",
    "modules/core/map",
    "modules/core/parametricURL",
    "modules/core/crs",
    "modules/core/autostarter",
    "modules/alerting/view"
    ], function ($, Config, Util, RawLayerList, RestReaderList, Preparser, Map, ParametricURL, CRS, Autostarter) {

    // Core laden
    new Autostarter();
    new Util();
    new RawLayerList();
    new Preparser();
    new ParametricURL();
    new CRS();
    new Map();

    // Graph laden
    require(["modules/tools/graph/model"], function (GraphModel) {
        new GraphModel();
    });

    // Module laden
    require(["modules/menu/menuLoader"], function (MenuLoader) {
        new MenuLoader();
    });
    new RestReaderList();

    require(["modules/remoteInterface/model"], function (Remoteinterface) {
        new Remoteinterface();
    });

    require(["modules/zoomToGeometry/model"], function (ZoomToGeometry) {
        new ZoomToGeometry();
    });

    if (Config.allowParametricURL && Config.allowParametricURL === true && Config.zoomtofeature) {
        require(["modules/zoomtofeature/model"], function (ZoomToFeature) {
            new ZoomToFeature();
        });
    }

    // load customModules from config
    if (Config.customModules) {
        _.each(Config.customModules, function (element) {
            require([element], function (CustomModule) {
                new CustomModule();
            });
         });
    }

    if (Config.geoAPI && Config.geoAPI === true) {
        require(["geoapi"], function () {
        });
    }

    require([
        "config",
        "backbone.radio"
    ], function (Config, Radio) {

        require(["modules/Snippets/slider/view", "modules/Snippets/slider/range/view", "modules/Snippets/dropdown/view"], function (SliderView, SliderRangeView, DropdownView) {
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

        if (Config.mouseHover && Config.mouseHover === true) {
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
        require(["modules/sidebar/view"], function (SidebarView) {
            var sidebarView = new SidebarView();
            // Tools
            _.each(Radio.request("Parser", "getItemsByAttributes", {type: "tool"}), function (tool) {
                switch (tool.id) {
                    case "animation": {
                        require(["modules/tools/animation/view"], function (AnimationView) {
                            new AnimationView();
                        });
                        break;
                    }
                    case "filter": {
                        require(["modules/tools/filter/view"], function (FilterView) {
                            new FilterView({domTarget: sidebarView.$el});
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
                        require(["modules/coordpopup/view"], function (CoordPopupView) {
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
                        require(["modules/legend/view", "modules/legend/viewMobile"], function (LegendView, MobileLegendView) {
                            if (Radio.request("Util", "isAny")) {
                                new MobileLegendView();
                            }
                            else {
                                new LegendView();
                            }
                        });
                        require(["modules/tools/addGeoJSON/model"], function (AddGeoJSON) {
                            new AddGeoJSON();
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
        require(["modules/controls/view"], function (ControlsView) {
            var controls = Radio.request("Parser", "getItemsByAttributes", {type: "control"}),
                controlsView = new ControlsView();

            _.each(controls, function (control) {
                switch (control.id) {
                    case "toggleMenu": {
                        if (control.attr === true) {
                            var el = controlsView.addRow(control.id);

                            require(["modules/controls/togglemenu/view"], function (ToggleMenuControlView) {
                                new ToggleMenuControlView({el: el});
                            });
                        }
                        break;
                    }
                    case "zoom": {
                        if (control.attr === true) {
                            var el = controlsView.addRow(control.id);

                            require(["modules/controls/zoom/view"], function (ZoomControlView) {
                                new ZoomControlView({el: el});
                            });
                        }
                        break;
                    }
                    case "orientation": {
                        var el = controlsView.addRow(control.id);

                        require(["modules/controls/orientation/view"], function (OrientationView) {
                            new OrientationView({el: el});
                        });
                        break;
                    }
                    case "mousePosition": {
                        if (control.attr === true) {
                            require(["modules/controls/mousePosition/view"], function (MousePositionView) {
                                new MousePositionView();
                            });
                        }
                        break;
                    }
                    case "fullScreen": {
                        if (control.attr === true) {
                            var el = controlsView.addRow(control.id);

                            require(["modules/controls/fullScreen/view"], function (FullScreenView) {
                                new FullScreenView({el: el});
                            });
                        }
                        break;
                    }
                    case "attributions": {
                        if (control.attr === true || typeof control.attr === "object") {
                            require(["modules/controls/attributions/view"], function (AttributionsView) {
                                new AttributionsView();
                            });
                        }
                        break;
                    }
                }
            });
        });

        require(["modules/mapMarker/view"], function (MapMarkerView) {
            new MapMarkerView();
        });

        var sbconfig = Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"})[0].attr;

        if (sbconfig) {
            require(["modules/searchbar/view"], function (SearchbarView) {
                var title = Radio.request("Parser", "getPortalConfig").PortalTitle;

                new SearchbarView(sbconfig);
                if (title) {
                    require(["modules/title/view"], function (TitleView) {
                        new TitleView(title);
                    });
                }
            });
        }

        require(["modules/tools/styleWMS/view"], function (StyleWMSView) {
            new StyleWMSView();
        });

        Radio.trigger("Util", "hideLoader");
    });
});
