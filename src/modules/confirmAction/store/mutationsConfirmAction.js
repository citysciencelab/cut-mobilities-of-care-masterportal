export default {
    /**
     * Adds a single action with a push.
     * @param {object} state state
     * @param {object} newAction new action
     * @returns {void}
     */
    addToActions (state, newAction) {
        state.queue.push(newAction);
    },

    /**
     * Pops the last action.
     * @param {object} state state
     * @returns {void}
     */
    removeLastAction (state) {
        state.queue.pop();
    },

    /**
     * Sets the readyToShow flag toggling the modal's visibility.
     * @param {object} state state
     * @param {boolean} readyToShow visibility flag
     * @returns {void}
     */
    setReadyToShow (state, readyToShow) {
        state.readyToShow = readyToShow;
    }
};
