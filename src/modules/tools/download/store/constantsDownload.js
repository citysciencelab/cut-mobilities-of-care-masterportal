import actions from "./actionsDownload";
import getters from "./gettersDownload";
import mutations from "./mutationsDownload";

export default {
    getters: Object.keys(getters),
    mutations: Object.keys(mutations),
    actions: Object.keys(actions)
};
