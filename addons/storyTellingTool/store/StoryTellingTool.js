import GenericTool from "../../../src/modules/tools/indexTools";
import composeModules from "../../../src/app-store/utils/composeModules";
import actions from "./actionsStoryTellingTool";
import getters from "./gettersStoryTellingTool";
import mutations from "./mutationsStoryTellingTool";
import state from "./stateStoryTellingTool";

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
