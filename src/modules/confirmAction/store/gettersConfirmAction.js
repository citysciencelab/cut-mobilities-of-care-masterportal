export default {
    /**
     * Getter for showTheModal.
     * @param {object} state state
     * @returns {boolean} showTheModal
     */
    showTheModal: (state) => {
        return state.showTheModal;
    },

    /**
     * This returns the oldest ConfirmAction.
     * @param {object} state state
     * @returns {array} oldest ConfirmAction
     */
    currentConfirmAction: (state) => {
        if (state.queue.length > 0) {
            return state.queue[0];
        }
        return state.confirmActionProto;
    }
};
