import RestReaderList from "../modules/restReader/collection";
import Autostarter from "../modules/core/autostarter";
import Util from "../modules/core/util";
import StyleList from "../modules/vectorStyle/list";
import RawLayerList from "../modules/core/rawLayerList";
import Preparser from "../modules/core/configLoader/preparser";
import ParametricURL from "../modules/core/parametricURL";
import CRS from "../modules/core/crs";
import Map from "../modules/core/map";
import AddGeoJSON from "../modules/tools/addGeoJSON/model";
import WPS from "../modules/core/wps";
import RemoteInterface from "../modules/remoteInterface/model";
import CswParserModel from "../modules/cswParser/model";
import WFSTransactionModel from "../modules/wfsTransaction/model";
import GraphModel from "../modules/tools/graph/model";
import MenuLoader from "../modules/menu/menuLoader";
import ZoomToGeometry from "../modules/zoomToGeometry/model";
import ZoomToFeature from "../modules/zoomtofeature/model";
import SliderView from "../modules/snippets/slider/view";
import SliderRangeView from "../modules/snippets/slider/range/view";
import DropdownView from "../modules/snippets/dropdown/view";
import LayerinformationModel from "../modules/layerinformation/model";
import FooterView from "../modules/footer/view";
import ClickCounterView from "../modules/ClickCounter/view";
import MouseHoverPopupView from "../modules/mouseHover/view";
import QuickHelpView from "../modules/quickhelp/view";
import ScaleLineView from "../modules/scaleline/view";
import WindowView from "../modules/window/view";
import SidebarView from "../modules/sidebar/view";
import LegendLoader from "../modules/legend/legendLoader";
import MeasureView from "../modules/tools/measure/view";
import CoordPopupView from "../modules/tools/getCoord/view";
import DrawView from "../modules/tools/draw/view";
import ParcelSearchView from "../modules/tools/parcelSearch/view";
import SearchByCoordView from "../modules/tools/searchByCoord/view";
import LineView from "../modules/tools/pendler/lines/view";
import AnimationView from "../modules/tools/pendler/animation/view";
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
import PrintView from "../modules/tools/print_/view";
// @deprecated in version 3.0.0
// remove "version" in doc and config.
// rename "print_" to "print"
// only load PrintView
import PrintView2 from "../modules/tools/print/view";
// controls
import ControlsView from "../modules/controls/view";
import ZoomControlView from "../modules/controls/zoom/view";
import OrientationView from "../modules/controls/orientation/view";
import MousePositionView from "../modules/controls/mousePosition/view";
import FullScreenView from "../modules/controls/fullScreen/view";
import TotalView from "../modules/controls/totalview/view";
import AttributionsView from "../modules/controls/attributions/view";
import OverviewmapView from "../modules/controls/overviewmap/view";
import FreezeModel from "../modules/controls/freeze/model";
import MapMarkerView from "../modules/mapMarker/view";
import SearchbarView from "../modules/searchbar/view";
import TitleView from "../modules/title/view";
import HighlightFeature from "../modules/highlightFeature/model";
import "es6-promise/auto";

var sbconfig, controls, controlsView;

function loadApp () {
    // RemoteInterface laden
    if (_.has(Config, "remoteInterface")) {
        new RemoteInterface(Config.remoteInterface);
    }
    // Core laden
    new Autostarter();
    new Util(_.has(Config, "uiStyle") ? {uiStyle: Config.uiStyle.toUpperCase()} : {});
    new RawLayerList();
    new RestReaderList();
    new Preparser();
    new StyleList();
    new ParametricURL();
    new CRS();
    new Map();
    new WPS();
    new AddGeoJSON();
    new CswParserModel();
    new GraphModel();
    new WFSTransactionModel();
    new MenuLoader();
    new ZoomToGeometry();


    if (_.has(Config, "zoomToFeature")) {
        new ZoomToFeature(Config.zoomToFeature);
    }

    new SliderView();
    new SliderRangeView();
    new DropdownView();

    new LayerinformationModel(_.has(Config, "cswId") ? {cswId: Config.cswId} : {});

    if (_.has(Config, "footer")) {
        new FooterView(Config.footer);
    }


    if (_.has(Config, "clickCounter") && _.has(Config.clickCounter, "desktop") && Config.clickCounter.desktop !== "" && _.has(Config.clickCounter, "mobile") && Config.clickCounter.mobile !== "") {
        new ClickCounterView(Config.clickCounter.desktop, Config.clickCounter.mobile);
    }

    if (_.has(Config, "mouseHover")) {
        new MouseHoverPopupView(Config.mouseHover);
    }


    if (_.has(Config, "quickHelp") && Config.quickHelp === true) {
        new QuickHelpView();
    }

    if (_.has(Config, "scaleLine") && Config.scaleLine === true) {
        new ScaleLineView();
    }

    new WindowView();
    // Module laden
    // Tools

    new SidebarView();

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
            case "lines": {
                new LineView({model: tool});
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
            case "print": {
                // @deprecated in version 3.0.0
                // remove "version" in doc and config.
                // rename "print_" to "print"
                // only load correct view
                if (tool.has("version") && tool.get("version") === "mapfish_print_3") {
                    new PrintView({model: tool});
                }
                else {
                    new PrintView2({model: tool});
                }
                break;
            }
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

    const style = Radio.request("Util", "getUiStyle");

    if (!style || style !== "SIMPLE") {
        controls = Radio.request("Parser", "getItemsByAttributes", {type: "control"});
        controlsView = new ControlsView();

        _.each(controls, function (control) {
            var element;

            switch (control.id) {
                case "zoom": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new ZoomControlView({el: element});
                    }
                    break;
                }
                case "orientation": {
                    element = controlsView.addRowTR(control.id, true);
                    new OrientationView({el: element, attr: {config: {epsg: Radio.request("MapView", "getProjection").getCode()}}});
                    break;
                }
                case "mousePosition": {
                    if (control.attr === true) {
                        element = controlsView.addRowBL(control.id);
                        new MousePositionView({el: element});
                    }
                    break;
                }
                case "fullScreen": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new FullScreenView({el: element});
                    }
                    break;
                }
                case "totalview": {
                    if (control.attr === true) {
                        new TotalView();
                    }
                    break;
                }
                case "attributions": {
                    if (control.attr === true || typeof control.attr === "object") {
                        element = controlsView.addRowBR(control.id);
                        new AttributionsView({el: element});
                    }
                    break;
                }
                case "overviewmap": {
                    if (control.attr === true || typeof control.attr === "object") {
                        element = controlsView.addRowBR(control.id);
                        new OverviewmapView({el: element});
                    }
                    break;
                }
                case "freeze": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new FreezeModel({uiStyle: style, el: element});
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }


    new MapMarkerView();

    sbconfig = _.extend({}, _.has(Config, "quickHelp") ? {quickHelp: Config.quickHelp} : {});
    sbconfig = _.extend(sbconfig, Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"})[0].attr);
    if (sbconfig) {
        new SearchbarView(sbconfig);
        if (Radio.request("Parser", "getPortalConfig").PortalTitle || Radio.request("Parser", "getPortalConfig").portalTitle) {
            new TitleView();
        }
    }

    new HighlightFeature();

    // Variable CUSTOMMODULE wird im webpack.DefinePlugin gesetzt
    if (CUSTOMMODULE !== "") {
        return import(/* webpackMode: "eager" */ CUSTOMMODULE)
        .then(module => {
            new module.default;
        })
        .catch(error => {
            Radio.trigger("Alert", "alert", "Entschuldigung, diese Anwendung konnte nicht vollständig geladen werden. Bitte wenden sie sich an den Administrator.");
        });
    }

    Radio.trigger("Util", "hideLoader");
}

export {loadApp};
