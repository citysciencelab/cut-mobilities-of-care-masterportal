import GenericTool from "../../indexTools";
import composeModules from "../../../../app-store/utils/composeModules";
import mutations from "./mutationsScaleSwitcher";
import actions from "./actionsScaleSwitcher";
import getters from "./gettersScaleSwitcher";
import state from "./stateScaleSwitcher";

export default composeModules([GenericTool, {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}]);

