import actions from "./actionsAlerting";
import mutations from "./mutationsAlerting";

export default {
    namespaced: true,
    state: {
        alerts: [],
        category: "alert-info",
        isDismissable: true,
        isConfirmable: false,
        position: "top-center",
        fadeOut: null,
        uuid: 0
    },
    actions,
    mutations
};
