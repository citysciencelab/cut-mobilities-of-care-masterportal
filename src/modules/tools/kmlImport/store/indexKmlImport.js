import GenericTool from "../../indexTools";
import composeModules from "../../../../app-store/utils/composeModules";
import mutations from "./mutationsKmlImport";
import actions from "./actionsKmlImport";

export default composeModules([GenericTool, {
    namespaced: true,
    state: {
        active: false,
        // change this to render in window or in sidebar
        // renderToWindow: true, NOTE commented out for composeModules test
        id: "coord",
        title: "Koordinaten abfragen",
        deactivateGFI: true,
        glyphicon: "glyphicon-screenshot",
        // KmlImport specific:
        selectPointerMove: null,
        projections: [],
        mapProjection: null,
        positionMapProjection: [],
        updatePosition: true,
        currentProjectionName: "EPSG:25832",
        currentSelection: "EPSG:4326"
    },
    mutations,
    actions
}]);
