import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig.js";
import store from "../../../app-store";


/** @const {String} [Path array of possible config locations. First one found will be used] */
/** @const {object} [vue actions] */
const configPaths = [
    "configJs.remoteInterface"
];

export default {
    initialize: context => {
        const configFetchSuccess = fetchFirstModuleConfig(context, configPaths, "RemoteInterface");

        if (!configFetchSuccess) {
            // insert fallback: recursive config dearch for backwards compatibility
            // see helpers.js@fetchFirstModuleConfig() for alternative place for this
        }
    },
    
    processMessage: (context, event) => {
        if (event.data.namespace === undefined || event.data.action === undefined) {
            return;
        }

        if (event.data.args === undefined) {
            event.data.args = null;
        }

        store.dispatch(event.data.namespace + "/" + event.data.action, event.data.args, {root: true});
        
        window.parent.postMessage("bar");

    }
        
        
        
};
