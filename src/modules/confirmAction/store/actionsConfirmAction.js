export default {
    /**
     * Removes oldest ConfirmAction and hide modal.
     * @param {object} state state
     * @param {object} commit commit
     * @returns {void}
     */
    cleanup: function ({state, commit}) {
        commit("removeLastAction");
        commit("setReadyToShow", false);
    },

    /**
     * Checks a new alert object, if it may be added to alerting queue. This includes checking, if
     *  1: alert is already in queue
     *  2: alert is limited to be displayed in a past time
     *  3: alert is limited to be display in the future
     *  4: alert has already been read and is not ready to be displayed again yet
     * @param {object} state state
     * @param {object} newAlert alert object to be added to queue
     * @returns {void}
     */
    addSingleAlert: function ({state, commit}, newAlert) {
        const objectHash = require("object-hash"),
            newAlertObj = typeof newAlert === "string" ? {content: newAlert} : newAlert,
            alertProtoClone = {...state.alertProto};

        let
            isUnique = false,
            isNotRestricted = false,
            isInTime = false,
            displayAlert = false;

        // in case its an object with deprecated text property, display warning and continue
        if (typeof newAlertObj.text === "string" && typeof newAlertObj.content !== "string") {
            console.warn("Deprecated: Alerting module - property \"text\" is deprecated. Use \"content\" instead.");
            newAlertObj.content = newAlertObj.text;
        }

        // in case its not an object with a non empty string at .content, dont continue
        if (typeof newAlertObj.content !== "string" || newAlertObj.content.length < 1) {
            console.warn("Alert cancelled, bad content value:", newAlertObj.content);
            return false;
        }

        for (const key in newAlertObj) {
            alertProtoClone[key] = newAlertObj[key];
        }

        alertProtoClone.hash = alertProtoClone.content;
        if (typeof alertProtoClone.displayFrom === "string") {
            alertProtoClone.hash = alertProtoClone.hash + alertProtoClone.displayFrom;
        }
        if (typeof alertProtoClone.displayUntil === "string") {
            alertProtoClone.hash = alertProtoClone.hash + alertProtoClone.displayUntil;
        }
        alertProtoClone.hash = objectHash(alertProtoClone.hash);

        isUnique = findSingleAlertByHash(state.alerts, alertProtoClone.hash) === false;
        if (!isUnique) {
            console.warn("Alert ignored (duplicate): " + alertProtoClone.hash);
        }

        isInTime = checkAlertLifespan(alertProtoClone);
        if (!isInTime) {
            console.warn("Alert ignored (not the time): " + alertProtoClone.hash);
        }

        isNotRestricted = checkAlertViewRestriction(state.displayedAlerts, alertProtoClone);
        if (!isNotRestricted) {
            console.warn("Alert ignored (shown recently): " + alertProtoClone.hash);
        }

        displayAlert = isUnique && isInTime && isNotRestricted;
        if (displayAlert) {
            commit("addToAlerts", alertProtoClone);
        }

        // even if current alert got seeded out, there still might be another one in the pipe
        if (state.alerts.length > 0) {
            commit("setReadyToShow", true);
        }

        return displayAlert;
    }
};
