import actions from "./actions";
import mutations from "./mutations";

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
