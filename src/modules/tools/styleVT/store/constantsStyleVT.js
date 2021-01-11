import actions from "./actionsStyleVT";
import getters from "./gettersStyleVT";
import mutations from "./mutationsStyleVT";

const actionKeys = Object.keys(actions),
    getterKeys = Object.keys(getters),
    mutationKeys = Object.keys(mutations);

export {
    actionKeys,
    getterKeys,
    mutationKeys
};
