import actions from "./actionsScaleLine";
import mutations from "./mutationsScaleLine";

export default {
    namespaced: true,
    state: {
        scaleNumber: "",
        scaleLineValue: "",
        mapMode: "2D",
        insideFooter: false,
        scaleLine: false
    },
    actions,
    mutations
};
