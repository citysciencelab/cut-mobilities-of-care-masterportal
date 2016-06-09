define("app",
    [
    "jquery",
    "config",
    "modules/core/util",
    "modules/core/rawLayerList",
    "modules/restReader/collection",
    "modules/core/parser/preparser",
    "modules/core/map",
    "modules/parametricURL/model"
    ], function ($, Config, Util, RawLayerList, RestReaderList, Preparser, Map, ParametricURL) {

    // Core laden
    new RawLayerList();
    new Preparser();
    new ParametricURL();
    new Map();

    // Module laden

    require(["modules/menu/listView"], function (Menu) {
        new Menu();
    });
    require(["modules/alerting/view"]);
    new RestReaderList();


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

    // Macht noch Probleme
    // if (Config.attributions && Config.attributions === true) {
    //     require(["modules/attribution/view"], function (AttView) {
    //         new AttView();
    //     });
    // }

    if (Config.geoAPI && Config.geoAPI === true) {
        require(["geoapi"], function () {
        });
    }

    require([
        "modules/core/map",
        "config",
        "backbone.radio"
    ], function (Map, Config, Radio) {

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

        require(["modules/window/view"], function (WindowView) {
            new WindowView();
        });

        // Tools
        _.each(Radio.request("Parser", "getItemsByAttributes", {type: "tool"}), function (tool) {
            switch (tool.id) {
                case "gfi": {
                    require(["modules/gfipopup/popup/view"], function (GFIPopupView) {
                        new GFIPopupView();
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
                case "legend": {
                    require(["modules/legend/view", "modules/legend/viewMobile", "modules/core/util"], function (LegendView, MobileLegendView, Util) {
                        if (Util.isAny()) {
                            new MobileLegendView();
                        }
                        else {
                            new LegendView();
                        }
                    });
                    break;
                }
                default: {
                    break;
                }
            }
        });

        require(["modules/mapMarker/view"], function (MapMarkerView) {
            new MapMarkerView();
        });

        if (_.has(Config, "searchBar") === true) {
            require(["modules/searchbar/view"], function (SearchbarView) {
                new SearchbarView(Config.searchBar, Config.searchBar.initString);
            });
        }

        if (Config.menubar === true) {
            require(["modules/menubar/view", "modules/controls/view"], function (MenubarView, ControlsView) {
                new MenubarView();
                if ($("#map").is(":visible") === true) {
                    new ControlsView();
                }
                // require(["modules/window/view"], function (WindowView) {
                //     new WindowView();
                // });
                // if (_.has(Config, "tools") === true) {
                    // require(["modules/tools/listView"], function (ToolsListView) {
                    //     new ToolsListView();
                    // });
                    // if (_.has(Config.tools, "coord") === true) {
                    //     require(["modules/coordpopup/view"], function (CoordPopupView) {
                    //         new CoordPopupView();
                    //     });
                    // }
                    // if (_.has(Config.tools, "gfi") === true) {
                    //     require(["modules/gfipopup/popup/view", "modules/gfipopup/popup/viewMobile", "modules/core/util"], function (GFIPopupView, MobileGFIPopupView, Util) {
                    //         if (Util.isAny()) {
                    //             new MobileGFIPopupView();
                    //         }
                    //         else {
                    //             new GFIPopupView();
                    //         }
                    //     });
                    // }
                    // if (_.has(Config.tools, "measure") === true && !Util.isAny()) {
                    //     require(["modules/tools/measure/view"], function (MeasureView) {
                    //         new MeasureView();
                    //     });
                    // }
                    // if (_.has(Config.tools, "draw") === true && !Util.isAny()) {
                    //     require(["modules/tools/draw/view"], function (DrawView) {
                    //         new DrawView();
                    //     });
                    // }
                    // if (_.has(Config.tools, "kmlimport") === true && !Util.isAny()) {
                    //     require(["modules/tools/kmlimport/view"], function (ImportView) {
                    //         new ImportView();
                    //     });
                    // }
                    // if (Config.tools.record === true) {
                    //     require(["modules/wfs_t/view"], function (WFS_TView) {
                    //         new WFS_TView();
                    //     });
                    // }
                    // if (_.has(Config.tools, "print") === true) {
                    //     require(["modules/tools/print/view"], function (PrintView) {
                    //         new PrintView();
                    //     });
                    // }
                    // if (_.has(Config.tools, "parcelSearch") === true) {
                    //     require(["modules/tools/parcelSearch/view"], function (ParcelSearchView) {
                    //         new ParcelSearchView();
                    //     });
                    // }
                    // if (_.has(Config.tools, "searchByCoord") === true) {
                    //     require(["modules/tools/searchByCoord/view"], function (SearchByCoordView) {
                    //         new SearchByCoordView();
                    //     });
                    // }
                // }
                if (_.has(Config.menuItems, "treeFilter") === true) {
                    require(["modules/treefilter/view"], function (TreeFilterView) {
                        new TreeFilterView();
                    });
                }

                if (_.has(Config.menuItems, "wfsFeatureFilter") === true) {
                    require(["modules/wfsfeaturefilter/view"], function (WFSFeatureFilterView) {
                        new WFSFeatureFilterView();
                    });
                }
                if (_.has(Config.menuItems, "legend") === true) {
                    require(["modules/legend/view", "modules/legend/viewMobile", "modules/core/util"], function (LegendView, MobileLegendView, Util) {
                        if (Util.isAny()) {
                            new MobileLegendView();
                        }
                        else {
                            new LegendView();
                        }
                    });
                }
                if (_.has(Config.menuItems, "routing") === true) {
                    require(["modules/routing/view"], function (RoutingView) {
                        new RoutingView();
                    });
                }
                if (_.has(Config.menuItems , "addWMS") === true) {
                    require(["modules/addwms/view"
                        ], function (AddWMSView) {
                        new AddWMSView();
                    });
                }
                if (_.has(Config.menuItems, "featureLister") === true && Config.menuItems.featureLister.lister > 0 && !Util.isAny()) {
                    require(["modules/featurelister/view"], function (FeatureLister) {
                        new FeatureLister();
                    });
                }
                if ($.isArray(Config.menuItems.formular)) {
                    $.each(Config.menuItems.formular, function (name, obj) {
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
