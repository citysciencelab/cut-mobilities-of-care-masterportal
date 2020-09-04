import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig.js";
import store from "../../../app-store";

/** @const {String} [Path array of possible config locations. First one found will be used] */
const configPaths = [
    "configJs.remoteInterface"
];

export default {
    initialize: context => {
        fetchFirstModuleConfig(context, configPaths, "RemoteInterface");
    },

    processMessage: (context, event) => {
        if (event.data.namespace === undefined || event.data.action === undefined) {
            return;
        }

        if (event.data.args === undefined) {
            event.data.args = null;
        }

        console.log(store);
        console.log(event.data);
        
        

        store.dispatch(event.data.namespace + "/" + event.data.action, event.data.args, {root: true});
    },

    sendMessage: ({state}, params) => {
        if (params instanceof Object === false) {
            console.error("RemoteInterface sendMessage error: Given param is not an Object.");
            return;
        }

        parent.postMessage(params, state.postMessageUrl);
    }
};
