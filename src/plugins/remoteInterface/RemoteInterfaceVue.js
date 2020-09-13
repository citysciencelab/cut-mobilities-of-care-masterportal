import store from "../../app-store";

export default {
    install (Vue, options) {
        if (options === undefined || typeof options.postMessageUrl !== "string") {
            console.error("RemoteInterfaceVue could not been installed: Param \"postMessageUrl\" missing.");
            return;
        }

        window.addEventListener("message", event => {
            if (event.data.namespace === undefined || event.data.action === undefined) {
                return;
            }

            if (event.data.args === undefined) {
                event.data.args = null;
            }

            store.dispatch(event.data.namespace + "/" + event.data.action, event.data.args, {root: true});
        });

        Vue.prototype.$remoteInterface = {
            sendMessage: params => {
                if (params instanceof Object === false) {
                    console.error("RemoteInterface sendMessage error: Given param is not an Object.");
                    return;
                }

                parent.postMessage(params, options.postMessageUrl);
            }
        };
    }
};
