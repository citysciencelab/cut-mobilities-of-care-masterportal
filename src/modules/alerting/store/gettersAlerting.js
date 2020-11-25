export default {
    /**
     * Getter for fetchBroadcastUrl.
     * @param {object} state state
     * @returns {string} fetchBroadcastUrl
     */
    fetchBroadcastUrl: (state) => {
        return state.fetchBroadcastUrl;
    },

    /**
     * Getter for localStorageDisplayedAlertsKey.
     * @param {object} state state
     * @returns {string} localStorageDisplayedAlertsKey
     */
    localStorageDisplayedAlertsKey: (state) => {
        return state.localStorageDisplayedAlertsKey;
    },

    /**
     * Getter for displayedAlerts.
     * @param {object} state state
     * @returns {object} displayedAlerts
     */
    displayedAlerts: (state) => {
        return state.displayedAlerts;
    },

    /**
     * Getter for readyToShow.
     * @param {object} state state
     * @returns {boolean} readyToShow
     */
    readyToShow: (state) => {
        return state.readyToShow;
    },

    /**
     * This returns the alerts queue array grouped by the alerts' category property.
     * @param {object} state state
     * @returns {array} sortedAlerts
     */
    sortedAlerts: (state) => {
        const
            resultByCategory = {},
            results = [];

        state.alerts.forEach(singleAlert => {
            if (resultByCategory[singleAlert.category] === undefined) {
                resultByCategory[singleAlert.category] = [];
            }
            resultByCategory[singleAlert.category].push({...singleAlert});
        });

        Object.keys(resultByCategory).forEach(key => {
            results.push({category: key, content: resultByCategory[key]});
        });

        return results;
    }
};
