export default {
    /**
     * Adds an alert to store.
     * @param {ActionContext} param0 - context passed by vuex
     * @param {string} alert - message to alert
     * @param {string} uuid - uuid for alert
     * @returns {void}
     */
    addAlert ({state, commit}, alert) {
        const newAlert = {
            id: "alert_" + state.uuid,
            message: "",
            category: state.category,
            isDismissable: state.isDismissable,
            isConfirmable: state.isConfirmable
        };

        if (typeof alert === "string") {
            newAlert.message = alert;
        }
        else if (typeof alert === "object") {
            newAlert.message = alert.text;
            if (alert.hasOwnProperty("id") === true) {
                newAlert.id = String(alert.id);
            }
            if (alert.hasOwnProperty("kategorie") === true) {
                newAlert.category = alert.kategorie;
            }
            if (alert.hasOwnProperty("dismissable") === true) {
                newAlert.isDismissable = alert.dismissable;
            }
            if (alert.hasOwnProperty("confirmable") === true) {
                newAlert.isConfirmable = alert.confirmable;
            }
            if (alert.hasOwnProperty("fadeOut") === true) {
                newAlert.fadeOut = alert.fadeOut;
            }
        }

        commit("updateUuid");
        commit("addAlert", newAlert);
    },

    /**
     * Removes one alert by id or all alerts from store.
     * @param {ActionContext} param0 - context passed by vuex
     * @param {string} [removeAlertId=""] - Id of the alert to be deleted.
     * @returns {void}
     */
    removeAlert ({commit}, removeAlertId = "") {
        if (removeAlertId !== "") {
            commit("removeAlertById", String(removeAlertId));
        }
        else {
            commit("removeAlerts");
        }
    }
};
