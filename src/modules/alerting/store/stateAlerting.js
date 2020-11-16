export default {
    fetchBroadcastUrl: false,
    // fetchBroadcastUrl: "https://localhost:9001/portal/master/ressources/broadcastedPortalAlerts.json",
    // fetchBroadcastUrl: "https://geoportal-hamburg.de/lgv-config/broadcastedPortalAlerts.json",
    localStorageDisplayedAlertsKey: "displayedAlerts",
    readyToShow: false,
    alertProto: {
        category: "Info",
        confirmText: "Als gelesen markieren",
        content: "",
        displayClass: "info",
        displayFrom: false, // "2020-01-01 00:00:00"
        displayUntil: false, // "2030-01-01 00:00:00"
        hash: "",
        legacy_onConfirm: false,
        mustBeConfirmed: false, // Boolean
        once: false // {seconds: 59, minutes: ...}
    },
    alerts: [],
    displayedAlerts: {}
};
