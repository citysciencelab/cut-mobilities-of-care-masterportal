import GenericTool from "../../indexTools";
import composeModules from "../../../../app-store/utils/composeModules";
import state from "./stateKmlImport";
import actions from "./actionsKmlImport";
import {generateSimpleGetters, generateSimpleMutations} from "../../../../app-store/utils/generators";


console.log({...generateSimpleMutations(state)});


export default composeModules([GenericTool, {
    namespaced: true,
    state,
    getters: {...generateSimpleGetters(state)},
    mutations: {...generateSimpleMutations(state)},
    actions
}]);

