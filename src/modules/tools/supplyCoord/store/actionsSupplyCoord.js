import {fetchFirstModuleConfig} from "../../../../utils/helper";

const configPaths = [
    "configJson.Portalconfig.menu.tools.children.coord"
];

export default {
    initialize: context => fetchFirstModuleConfig(context, configPaths, "coord"),
    activateByUrlParam: ({rootState, commit}) => {
        const mappings = ["supplycoord", "getcoords"];

        if (rootState.queryParams instanceof Object && rootState.queryParams.isinitopen !== undefined && mappings.indexOf(rootState.queryParams.isinitopen) !== -1) {
            commit("active", true);
        }
    }
};
