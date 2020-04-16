import actions from "./actions";
import mutations from "./mutations";

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
