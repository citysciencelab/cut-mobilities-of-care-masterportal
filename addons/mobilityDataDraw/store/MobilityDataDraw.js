import GenericTool from "../../../src/modules/tools/indexTools";
import composeModules from "../../../src/app-store/utils/composeModules";
import actions from "./actionsMobilityDataDraw";
import getters from "./gettersMobilityDataDraw";
import mutations from "./mutationsMobilityDataDraw";
import state from "./stateMobilityDataDraw";

export default composeModules([
    GenericTool,
    {
        namespaced: true, // mandatory
        state,
        actions,
        mutations,
        getters
    }
]);
