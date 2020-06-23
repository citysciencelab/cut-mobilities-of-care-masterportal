import {fetchFirstModuleConfig} from "../../../../utils/helper";

const configPaths = [
    "configJson.Portalconfig.menu.tools.children.kmlimport"
];

export default {
    initialize: context => fetchFirstModuleConfig(context, configPaths, "kmlimport"),
    activateByUrlParam: ({rootState, commit}) => {
        const mappings = ["kmlimport"];

        if (rootState.queryParams instanceof Object && rootState.queryParams.isinitopen !== undefined && mappings.indexOf(rootState.queryParams.isinitopen.toLowerCase()) !== -1) {
            console.log("COMMIT");
            
            commit("active", true);
        }
    }
};
