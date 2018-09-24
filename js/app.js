import Config from "@app/config";
import Alert from "../modules/alerting/view";
import RestReaderList from "../modules/restReader/collection";
// Autostarter = require("modules/core/autostarter"),
import Util from "../modules/core/util";
import StyleList from "../modules/vectorStyle/list";
import RawLayerList from "../modules/core/rawLayerList";
import Preparser from "../modules/core/configLoader/preparser";
import ParametricURL from "../modules/core/parametricURL";
import CRS from "../modules/core/crs";
import Map from "../modules/core/map";
// AddGeoJSON = require("modules/tools/addGeoJSON/model"),
// style,
let sbconfig;

// RemoteInterface laden
// if (_.has(Config, "remoteInterface")) {
//     require(["modules/remoteInterface/model"], function (RemoteInterface) {
//         new RemoteInterface(Config.remoteInterface);
//     });
// }
// Core laden
new Alert();
// new Autostarter();
new Util(_.has(Config, "uiStyle") ? {uiStyle: Config.uiStyle.toUpperCase()} : {});
new RawLayerList();
new RestReaderList();
new Preparser();
new StyleList();
new ParametricURL();
new CRS();
new Map();
// new WPS();
// new AddGeoJSON();

// Funktionalitäten laden
// CSW parser
// require(["modules/cswParser/model"], function (CswParserModel) {
//     new CswParserModel();
// });
// // Browser Druck Modul
// require(["modules/functionalities/browserPrint/model"], function (BrowserPrintModel) {
//     new BrowserPrintModel(_.has(Config, "browserPrint") ? Config.browserPrint : {});
// });
// Graph laden
import GraphModel from "../modules/tools/graph/model";
new GraphModel();

// // Module laden
// require(["modules/wfsTransaction/model"], function (WFSTransactionModel) {
//     new WFSTransactionModel();
// });

import MenuLoader from "../modules/menu/menuLoader";
new MenuLoader();

import ZoomToGeometry from "../modules/zoomToGeometry/model";
new ZoomToGeometry();

import ZoomToFeature from "../modules/zoomtofeature/model";
if (_.has(Config, "zoomToFeature")) {
    new ZoomToFeature(Config.zoomToFeature);
}

// // load customModules from config
// if (_.has(Config, "customModules") && Config.customModules.length > 0) {
//     _.each(Config.customModules, function (module) {
//         require([module], function (CustomModule) {
//             new CustomModule();
//         });
//     });
// }
//
import SliderView from "../modules/snippets/slider/view";
import SliderRangeView from "../modules/snippets/slider/range/view";
import DropdownView from "../modules/snippets/dropdown/view";
new SliderView();
new SliderRangeView();
new DropdownView();


import LayerinformationModel from "../modules/layerinformation/model";
new LayerinformationModel(_.has(Config, "cswId") ? {cswId: Config.cswId} : {});


import FooterView from "../modules/footer/view";
if (_.has(Config, "footer")) {
    new FooterView(Config.footer);
}

import ClickCounterView from "../modules/ClickCounter/view";
if (_.has(Config, "clickCounter") && _.has(Config.clickCounter, "desktop") && Config.clickCounter.desktop !== "" && _.has(Config.clickCounter, "mobile") && Config.clickCounter.mobile !== "") {
    new ClickCounterView(Config.clickCounter.desktop, Config.clickCounter.mobile);
}

import MouseHoverPopupView from "../modules/mouseHover/view";
if (_.has(Config, "mouseHover")) {
    new MouseHoverPopupView(Config.mouseHover);
}

import QuickHelpView from "../modules/quickhelp/view";
if (_.has(Config, "quickHelp") && Config.quickHelp === true) {
    new QuickHelpView();
}

import ScaleLineView from "../modules/scaleline/view";
if (_.has(Config, "scaleLine") && Config.scaleLine === true) {
    new ScaleLineView();
}

import WindowView from "../modules/window/view";
new WindowView();
// Module laden
// Tools
import SidebarView from "../modules/sidebar/view";
new SidebarView();

import GfiModel from "../modules/tools/gfi/model";
import LegendLoader from "../modules/legend/legendLoader";
import MeasureView from "../modules/tools/measure/view";
import CoordPopupView from "../modules/tools/getCoord/view";
import DrawView from "../modules/tools/draw/view";
import ParcelSearchView from "../modules/tools/parcelSearch/view";
import SearchByCoordView from "../modules/tools/searchByCoord/view";
import AnimationView from "../modules/tools/animation/view";
import FilterView from "../modules/tools/filter/view";
import SaveSelectionView from "../modules/tools/saveSelection/view";
import StyleWMSView from "../modules/tools/styleWMS/view";
import LayersliderView from "../modules/tools/layerslider/view";
import CompareFeaturesView from "../modules/tools/compareFeatures/view";
import EinwohnerabfrageView from "../modules/tools/einwohnerabfrage_hh/selectView";
import ImportView from "../modules/tools/kmlimport/view";
import WFSFeatureFilterView from "../modules/wfsfeaturefilter/view";
import ExtendedFilterView from "../modules/tools/extendedFilter/view";
import AddWMSView from "../modules/tools/addwms/view";
import RoutingView from "../modules/tools/viomRouting/view";
import SchulwegRoutingView from "../modules/tools/schulwegRouting_hh/view";
import Contact from "../modules/contact/view";
import TreeFilterView from "../modules/treefilter/view";
import Formular from "../modules/formular/view";
import FeatureLister from "../modules/featurelister/view";


_.each(Radio.request("ModelList", "getModelsByAttributes", {type: "tool"}), function (tool) {
    switch (tool.id) {
        case "compareFeatures": {
            new CompareFeaturesView({model: tool});
            break;
        }
        case "einwohnerabfrage": {
            new EinwohnerabfrageView({model: tool});
            break;
        }
        case "animation": {
            new AnimationView({model: tool});
            break;
        }
        case "filter": {
            new FilterView({model: tool});
            break;
        }
        case "schulwegrouting": {
            new SchulwegRoutingView({model: tool});
            break;
        }
        case "gfi": {
            new GfiModel(_.extend(tool, _.has(Config, "gfiWindow") ? {desktopViewType: Config.gfiWindow} : {}));
            break;
        }
        case "coord": {
            new CoordPopupView({model: tool});
            break;
        }
        case "measure": {
            new MeasureView({model: tool});
            break;
        }
        case "draw": {
            new DrawView({model: tool});
            break;
        }
        // case "print": {
        //     // @deprecated in version 3.0.0
        //     // remove "version" in doc and config.
        //     // rename "print_" to "print"
        //     // only load correct view
        //     if (tool.has("version") && tool.get("version") === "mapfish_print_3") {
        //         require(["modules/tools/print_/view"], function (PrintView) {
        //             new PrintView({model: tool});
        //         });
        //     }
        //     else {
        //         require(["modules/tools/print/view"], function (PrintView) {
        //             new PrintView({model: tool});
        //         });
        //     }
        //     break;
        // }
        case "parcelSearch": {
            new ParcelSearchView({model: tool});
            break;
        }
        case "searchByCoord": {
            new SearchByCoordView({model: tool});
            break;
        }
        case "saveSelection": {
            new SaveSelectionView({model: tool});
            break;
        }
        case "kmlimport": {
            new ImportView({model: tool});
            break;
        }
        case "wfsFeatureFilter": {
            new WFSFeatureFilterView({model: tool});
            break;
        }
        case "extendedFilter": {
            new ExtendedFilterView({model: tool});
            break;
        }
        case "treeFilter": {
            new TreeFilterView({model: tool});
            break;
        }
        case "routing": {
            new RoutingView({model: tool});
            break;
        }
        case "contact": {
            new Contact({model: tool});
            break;
        }
        case "addWMS": {
            new AddWMSView({model: tool});
            break;
        }
        case "featureLister": {
            new FeatureLister({model: tool});
            break;
        }
        case "formular": {
            new Formular({model: tool});
            break;
        }
        case "legend": {
            new LegendLoader(tool);
            break;
        }
        case "styleWMS": {
            new StyleWMSView({model: tool});
            break;
        }
        case "layerslider": {
            new LayersliderView({model: tool});
            break;
        }
        default: {
            break;
        }
    }
});
// });

// controls
// style = Radio.request("Util", "getUiStyle");
//
// if (!style || style !== "SIMPLE") {
//     require(["modules/controls/view"], function (ControlsView) {
//         var controls = Radio.request("Parser", "getItemsByAttributes", {type: "control"}),
//             controlsView = new ControlsView();
//
//         _.each(controls, function (control) {
//             var element;
//
//             switch (control.id) {
//                 case "zoom": {
//
//                     if (control.attr === true) {
//
//                         element = controlsView.addRowTR(control.id);
//
//                         require(["modules/controls/zoom/view"], function (ZoomControlView) {
//                             new ZoomControlView({el: element});
//                         });
//                     }
//                     break;
//                 }
//                 case "orientation": {
//                     element = controlsView.addRowTR(control.id, true);
//
//                     require(["modules/controls/orientation/view"], function (OrientationView) {
//                         new OrientationView({el: element, attr: {config: {epsg: Radio.request("MapView", "getProjection").getCode()}}});
//                     });
//                     break;
//                 }
//                 case "mousePosition": {
//                     if (control.attr === true) {
//                         element = controlsView.addRowBL(control.id);
//
//                         require(["modules/controls/mousePosition/view"], function (MousePositionView) {
//                             new MousePositionView({el: element});
//                         });
//                     }
//                     break;
//                 }
//                 case "fullScreen": {
//                     if (control.attr === true) {
//                         element = controlsView.addRowTR(control.id);
//
//                         require(["modules/controls/fullScreen/view"], function (FullScreenView) {
//                             new FullScreenView({el: element});
//                         });
//                     }
//                     break;
//                 }
//                 case "totalview": {
//                     if (control.attr === true) {
//                         require(["modules/controls/totalview/view"], function (TotalView) {
//                             new TotalView();
//                         });
//                     }
//                     break;
//                 }
//                 case "attributions": {
//                     if (control.attr === true || typeof control.attr === "object") {
//                         element = controlsView.addRowBR(control.id);
//
//                         require(["modules/controls/attributions/view"], function (AttributionsView) {
//                             new AttributionsView({el: element});
//                         });
//                     }
//                     break;
//                 }
//                 case "overviewmap": {
//                     if (control.attr === true || typeof control.attr === "object") {
//                         element = controlsView.addRowBR(control.id);
//
//                         require(["modules/controls/overviewmap/view"], function (OverviewmapView) {
//                             new OverviewmapView({el: element});
//                         });
//                     }
//                     break;
//                 }
//                 case "freeze": {
//                     if (control.attr === true) {
//                         element = controlsView.addRowTR(control.id);
//
//                         require(["modules/controls/freeze/model"], function (FreezeModel) {
//                             new FreezeModel({uiStyle: style, el: element});
//                         });
//                     }
//                     break;
//                 }
//                 default: {
//                     break;
//                 }
//             }
//         });
//     });
// }

import MapMarkerView from "../modules/mapMarker/view";
new MapMarkerView();

import SearchbarView from "../modules/searchbar/view";
sbconfig = _.extend({}, _.has(Config, "quickHelp") ? {quickHelp: Config.quickHelp} : {});
sbconfig = _.extend(sbconfig, Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"})[0].attr);
if (sbconfig) {
    new SearchbarView(sbconfig);
    //     if (Radio.request("Parser", "getPortalConfig").PortalTitle || Radio.request("Parser", "getPortalConfig").portalTitle) {
    //         require(["modules/title/view"], function (TitleView) {
    //             new TitleView();
    //         });
    //     }
    // });
}

import HighlightFeature from "../modules/highlightFeature/model";
new HighlightFeature();

Radio.trigger("Util", "hideLoader");
