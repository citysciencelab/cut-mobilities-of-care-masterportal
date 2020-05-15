import {fetchFirstModuleConfig} from "../../../../utils/helper";

// Path array of possible config locations. First one found will be used.
const configPaths = [
    // commented for recursive test
    // "configJson.Portalconfig.menu.tools.children.coord"
];

export default {
    initialize: context => {
        const configFetchSuccess = fetchFirstModuleConfig(context, configPaths, "coord");

        if (!configFetchSuccess) {
            // insert fallback: recursive config dearch for backwards compatibility
            // see helpers.js@fetchFirstModuleConfig() for alternative place for this
        }
    }
};
