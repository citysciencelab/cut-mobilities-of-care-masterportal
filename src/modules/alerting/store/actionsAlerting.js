import * as moment from "moment";
import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig.js";

/** @const {String} [Path array of possible config locations. First one found will be used] */
/** @const {Object} [vue actions] */
const configPaths = [
    "configJs.alerting"
];

/**
 * Finds an alert by hash value
 * @param {Object[]} haystackAlerts an array of objects{hash, ...} with the alerts
 * @param {String} needleHash Hash of the wanted alert
 * @returns {Object|Boolean} Retrieved alert or false, if nothing found
 */
function findSingleAlertByHash (haystackAlerts, needleHash) {
    const foundAlerts = haystackAlerts.filter(singleAlert => singleAlert.hash === needleHash);

    return foundAlerts.length ? foundAlerts[0] : false;
}

/**
 * Checks if an alert should be displayed considerung its .displayFrom and .displayUntil properties.
 * @param {Object} alertToCheck The alert to check
 * @returns {Boolean} True if its defined timespan includes current time
 */
function checkAlertLifespan (alertToCheck) {
    return (!alertToCheck.displayFrom || moment().isAfter(alertToCheck.displayFrom)) && (!alertToCheck.displayUntil || moment().isBefore(alertToCheck.displayUntil));
}

/**
 * Checks if an already displayed alert may be displayed again.
 * @param {Object} displayedAlerts an object as collection of already displayed alerts with their hash value as associated key
 * @param {Object} alertToCheck The alert to check as object{hash, once, ...}
 * @returns {Boolean} True if the given alert may be displayed again
 */
function checkAlertViewRestriction (displayedAlerts, alertToCheck) {
    const alertDisplayedAt = displayedAlerts[alertToCheck.hash];

    // not yet displayed
    if (alertDisplayedAt === undefined) {
        return true;
    }
    // displayed, but not restricted to display multiple times
    if (alertToCheck.once === false) {
        return true;
    }
    // displayed and restricted to only a single time
    if (alertToCheck.once === true) {
        return false;
    }
    // displayed, but restriction time elapsed
    if (moment().isAfter(moment(alertDisplayedAt).add(moment.duration(alertToCheck.once)))) {
        return true;
    }

    return false;
}

export default {
    initialize: context => {
        const configFetchSuccess = fetchFirstModuleConfig(context, configPaths, "Alerting");

        if (!configFetchSuccess) {
            // insert fallback: recursive config dearch for backwards compatibility
            // see helpers.js@fetchFirstModuleConfig() for alternative place for this
        }

        // In case we need more than one config, we need to call fetchFirstModuleConfig() more than once.
        /*
        const additionalConfigFetchSuccess = fetchFirstModuleConfig(rootState, additionalConfigPaths, "Alerting");

        if (!additionalConfigFetchSuccess) {
            ...
        }
        */
    },
    setDisplayedAlerts: function ({commit}, alerts = {}) {
        commit("setDisplayedAlerts", alerts);
    },
    cleanup: function ({state, commit}) {
        state.alerts.forEach(singleAlert => {
            if (!singleAlert.mustBeConfirmed) {
                commit("removeFromAlerts", singleAlert);
                commit("addToDisplayedAlerts", singleAlert);
            }
        });
        commit("setReadyToShow", false);
    },
    alertHasBeenRead: function ({state, commit}, hash) {
        const singleAlert = findSingleAlertByHash(state.alerts, hash);

        if (singleAlert !== false) {
            commit("setAlertAsRead", singleAlert);
            if (typeof singleAlert.legacy_onConfirm === "function") {
                singleAlert.legacy_onConfirm();
            }
        }
    },
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
