import GenericTool from "../../indexTools";
import composeModules from "../../../../app-store/utils/composeModules";
import state from "./stateKmlImport";
import mutations from "./mutationsKmlImport";
import getters from "./gettersKmlImport";
import actions from "./actionsKmlImport";

export default composeModules([GenericTool, {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}]);

