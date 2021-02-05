import actions from "./actionsSaveSelection";
import getters from "./gettersSaveSelection";
import mutations from "./mutationsSaveSelection";

export default {
    actions: Object.keys(actions),
    getters: Object.keys(getters),
    mutations: Object.keys(mutations)
};
