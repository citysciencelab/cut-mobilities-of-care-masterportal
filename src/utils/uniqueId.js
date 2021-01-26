import state from "../app-store/state";

/**
 * Generate a globally-unique id for client-side models or DOM elements that need one. If prefix is passed, the id will be appended to it.
 * @param {String} [prefix=""] prefix for the id
 * @returns {String}  a globally-unique id
 */
function uniqueId (prefix) {
    const idCounter = String(getIdCounter());

    incIdCounter();

    return prefix ? prefix + idCounter : idCounter;
}

export default uniqueId;

/**
 * gets the current idCounter
 * @returns {Integer}  the current idCounter
 */
function getIdCounter () {
    return state.idCounter;
}

/**
 * increments the idCounter
 * @post the static idCounter (Util.idCounter) is incremented by 1
 * @returns {void}
 */
function incIdCounter () {
    state.idCounter++;
}
