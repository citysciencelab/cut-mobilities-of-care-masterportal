// if (window.location.href.charAt(window.location.href.length-1) === "#") {
//     window.location.href = window.location.href.substr(0, window.location.href.length-2);
// }
define("app", ["jquery", "config", "modules/core/util", "modules/core/rawLayerList"], function ($, Config, Util, RawLayerList) {
    "use strict";
    require(["modules/alerting/view"]);
    Util.showLoader();
    new RawLayerList();

    if (Config.allowParametricURL && Config.allowParametricURL === true) {
        require(["modules/parametricURL/model"], function (ParametricURL) {
            new ParametricURL();
        });
    }

    if (Config.allowParametricURL && Config.allowParametricURL === true && Config.zoomtofeature ) {
        require(["modules/zoomtofeature/model"], function (ZoomToFeature) {
            new ZoomToFeature();
        });
    }

    if (Config.tree.type === "custom") {
        require(["modules/treeconfig/list"], function (TreeConfig) {
            new TreeConfig();
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

    if (Config.attributions && Config.attributions === true) {
        require(["modules/attribution/view"], function (AttView) {
            new AttView();
        });
    }

    if (Config.geoAPI && Config.geoAPI === true) {
        require(["geoapi"], function () {
        });
    }

    require([
        "modules/core/map",
        "config",
        "jquery"
    ], function (Map, Config, $) {
        new Map();

        if (Util.isAny()) {
            require(["modules/layerinformation/viewMobile"], function (MobileLayerInformationView) {
                new MobileLayerInformationView();
            });
        }
        else {
            require(["modules/layerinformation/view"], function (LayerInformationView) {
                new LayerInformationView();
            });
        }

        if (Config.footer && Config.footer.visibility === true) {
            require(["modules/footer/view"], function (FooterView) {
                new FooterView();
            });
        }

        if (typeof (Config.clickCounter) === "object" && Config.clickCounter.version !== "") {
            require(["modules/ClickCounter/view"], function (ClickCounterView) {
                new ClickCounterView();
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

        if (Config.menubar === true) {
            require(["modules/menubar/view", "modules/controls/view"], function (MenubarView, ControlsView) {
                new MenubarView();
                if ($("#map").is(":visible") === true) {
                    new ControlsView();
                }
                require(["modules/window/view"], function (WindowView) {
                    new WindowView();
                });
                if (_.has(Config, "tools") === true) {
                    require(["modules/tools/listView"], function (ToolsListView) {
                        new ToolsListView();
                    });
                    if (_.has(Config.tools, "coord") === true) {
                        require(["modules/coordpopup/view"], function (CoordPopupView) {
                            new CoordPopupView();
                        });
                    }
                    if (_.has(Config.tools, "gfi") === true) {
                        require(["modules/gfipopup/popup/view", "modules/gfipopup/popup/viewMobile", "modules/core/util"], function (GFIPopupView, MobileGFIPopupView, Util) {
                            if (Util.isAny()) {
                                new MobileGFIPopupView();
                            }
                            else {
                                new GFIPopupView();
                            }
                        });
                    }
                    if (_.has(Config.tools, "measure") === true && !Util.isAny()) {
                        require(["modules/tools/measure/view"], function (MeasureView) {
                            new MeasureView();
                        });
                    }
                    if (_.has(Config.tools, "draw") === true && !Util.isAny()) {
                        require(["modules/tools/draw/view"], function (DrawView) {
                            new DrawView();
                        });
                    }
                    if (Config.tools.record === true) {
                        require(["modules/wfs_t/view"], function (WFS_TView) {
                            new WFS_TView();
                        });
                    }
                    if (_.has(Config.tools, "print") === true) {
                        require(["modules/tools/print/view"], function (PrintView) {
                            new PrintView();
                        });
                    }
                    if (_.has(Config.tools, "parcelSearch") === true) {
                        require(["modules/tools/parcelSearch/view"], function (ParcelSearchView) {
                            new ParcelSearchView();
                        });
                    }
                    if (_.has(Config.tools, "searchByCoord") === true) {
                        require(["modules/tools/searchByCoord/view"], function (SearchByCoordView) {
                            new SearchByCoordView();
                        });
                    }
                }
                if (Config.menu.treeFilter === true) {
                    require(["modules/treefilter/view"], function (TreeFilterView) {
                        new TreeFilterView();
                    });
                }
                if (Config.menu.searchBar === true && Config.searchBar) {
                    require(["modules/searchbar/view", "modules/mapMarker/view"], function (SearchbarView, MapMarkerView) {
                        new MapMarkerView();
                        new SearchbarView(Config.searchBar, Config.searchBar.initString);
                    });
                }
                if (Config.menu.wfsFeatureFilter === true) {
                    require(["modules/wfsfeaturefilter/view"], function (WFSFeatureFilterView) {
                        new WFSFeatureFilterView();
                    });
                }
                if (Config.menu.legend === true) {
                    require(["modules/legend/view", "modules/legend/viewMobile", "modules/core/util"], function (LegendView, MobileLegendView, Util) {
                        if (Util.isAny()) {
                            new MobileLegendView();
                        }
                        else {
                            new LegendView();
                        }
                    });
                }
                if (Config.menu.routing === true) {
                    require(["modules/routing/view"], function (RoutingView) {
                        new RoutingView();
                    });
                }
                if (Config.menu.addWMS === true) {
                    require(["modules/addwms/view"
                        ], function (AddWMSView) {
                        new AddWMSView();
                    });
                }
                if (_.has(Config.menu, "featureLister") === true && Config.menu.featureLister > 0 && !Util.isAny()) {
                    require(["modules/featurelister/view"], function (FeatureLister) {
                        new FeatureLister();
                    });
                }
                if ($.isArray(Config.menu.formular)) {
                    $.each(Config.menu.formular, function (name, obj) {
                        if (obj.title !== "" && obj.symbol !== "" && obj.modelname !== "") {
                            require(["modules/formular/view"], function (FormularView) {
                                new FormularView(obj.modelname, obj.title, obj.symbol);
                            });
                        }
                    });
                }
                if (_.has(Config.menu, "contact") === true && _.isObject(Config.menu.contact) === true) {
                    require(["modules/contact/view"], function (Contact) {
                        new Contact();
                    });
                }
            });
        }
    });
    Util.hideLoader();
});
