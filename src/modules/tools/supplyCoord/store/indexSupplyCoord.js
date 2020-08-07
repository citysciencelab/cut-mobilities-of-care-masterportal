import GenericTool from "../../indexTools";
import composeModules from "../../../../app-store/utils/composeModules";
import getters from "./gettersSupplyCoord";
import mutations from "./mutationsSupplyCoord";
import actions from "./actionsSupplyCoord";
import state from "./stateSupplyCoord";

export default composeModules([GenericTool, {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}]);
