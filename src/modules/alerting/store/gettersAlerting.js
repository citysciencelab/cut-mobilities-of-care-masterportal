export default {
    fetchBroadcastUrl: (state) => {
        return state.fetchBroadcastUrl;
    },
    localStorageDisplayedAlertsKey: (state) => {
        return state.localStorageDisplayedAlertsKey;
    },
    displayedAlerts: (state) => {
        return state.displayedAlerts;
    },
    readyToShow: (state) => {
        return state.readyToShow;
    },
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
