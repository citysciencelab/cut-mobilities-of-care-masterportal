import GenericTool from "../../indexTools";
import composeModules from "../../../../app-store/utils/composeModules";
import mutations from "./mutationsKmlImport";
import actions from "./actionsKmlImport";

export default composeModules([GenericTool, {
    namespaced: true,
    state: {
        active: false,
        deactivateGFI: false,
        glyphicon: "glyphicon-load",
        id: "kmlImport",
        title: "KML-Datei laden"
    },
    mutations,
    actions
}]);
