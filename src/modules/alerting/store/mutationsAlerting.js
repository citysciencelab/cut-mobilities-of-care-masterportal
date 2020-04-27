export default {
    /**
     * Adds an alert to state if the message to report is not a duplicate.
     * @param {object} state - vuex store
     * @param {object} newAlert - new alert
     * @returns {void}
     */
    addAlert (state, newAlert) {
        const findAlert = state.alerts.find(alert => {
            return alert.message.trim() === newAlert.message.trim();
        });

        if (findAlert === undefined) {
            state.alerts.push(newAlert);
        }
    },

    /**
     * Update the uuid + 1.
     * @param {object} state  - vuex store
     * @returns {void}
     */
    updateUuid (state) {
        state.uuid += 1;
    },

    /**
     * Removes an alert by a given Id.
     * @param {object} state - vuex store
     * @param {string} removeAlertId - Id of the alert to be removed
     * @returns {void}
     */
    removeAlertById (state, removeAlertId) {
        state.alerts = state.alerts.filter(alert => {
            return alert.id !== removeAlertId;
        });
    },

    /**
     * Clears the state alerts.
     * @param {object} state - vuex store
     * @returns {void}
     */
    removeAlerts (state) {
        state.alerts = [];
    }
};
