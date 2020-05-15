import * as moment from "moment";

export default {
    setConfigs (state, configs) {
        state.configJs = configs;
    },
    addToAlerts (state, newAlert) {
        state.alerts.push(newAlert);
    },
    removeFromAlerts (state, alertToRemove) {
        state.alerts = state.alerts.filter(singleAlert => singleAlert.hash !== alertToRemove.hash);
    },
    setReadyToShow (state, readyToShow) {
        state.readyToShow = readyToShow;
    },
    setAlertAsRead (state, singleAlert) {
        singleAlert.mustBeConfirmed = false;
    },
    addToDisplayedAlerts (state, newAlert) {
        // for reactivity
        state.displayedAlerts = {...state.displayedAlerts, [newAlert.hash]: moment().format()};
    },
    setDisplayedAlerts (state, alerts) {
        state.displayedAlerts = alerts;
    }
};
