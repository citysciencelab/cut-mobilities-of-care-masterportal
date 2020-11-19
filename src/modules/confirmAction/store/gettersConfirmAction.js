export default {
    /**
     * Getter for readyToShow.
     * @param {object} state state
     * @returns {boolean} readyToShow
     */
    readyToShow: (state) => {
        return state.readyToShow;
    },

    /**
     * This returns the oldest ConfirmAction.
     * @param {object} state state
     * @returns {array} oldest ConfirmAction
     */
    nextConfirmAction: (state) => {
        return state.queue[state.queue.length - 1];
    }
};
