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
     * Removes the oldest confirmAction.
     * @param {object} state state
     * @returns {void}
     */
    removeOldestAction (state) {
        state.queue.shift();
    },

    /**
     * Sets the showTheModal flag toggling the modal's visibility.
     * @param {object} state state
     * @param {boolean} showTheModal visibility flag
     * @returns {void}
     */
    setReadyToShow (state, showTheModal) {
        state.showTheModal = showTheModal;
    }
};
