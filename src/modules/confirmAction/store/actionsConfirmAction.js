export default {
    /**
     * Removes oldest ConfirmAction and hides modal.
     * Then, if there is another confirmAction, show that one after a brief moment.
     * @param {object} state state
     * @param {object} commit commit
     * @returns {void}
     */
    cleanup: function ({state, commit}) {
        commit("removeOldestAction");
        commit("setReadyToShow", false);

        if (state.queue.length > 0) {
            setTimeout(() => {
                commit("setReadyToShow", true);
            }, 500);
        }
    },

    /**
     * Calls the actionEscapedCallback callback, if available. Then hides the modal.
     * @param {object} state state
     * @param {object} commit commit
     * @returns {void}
     */
    actionEscapedCallback: function ({state, commit}) {
        if (typeof state.queue[0].actionEscapedCallback === "function") {
            state.queue[0].actionEscapedCallback();
        }
        commit("setReadyToShow", false);
    },

    /**
     * Calls the actionDeniedCallback callback, if available. Then hides the modal.
     * @param {object} state state
     * @param {object} commit commit
     * @returns {void}
     */
    actionDeniedCallback: function ({state, commit}) {
        if (typeof state.queue[0].actionDeniedCallback === "function") {
            state.queue[0].actionDeniedCallback();
        }
        commit("setReadyToShow", false);
    },

    /**
     * Calls the actionConfirmedCallback callback, if available. Then hides the modal.
     * @param {object} state state
     * @param {object} commit commit
     * @returns {void}
     */
    actionConfirmedCallback: function ({state, commit}) {
        if (typeof state.queue[0].actionConfirmedCallback === "function") {
            state.queue[0].actionConfirmedCallback();
        }
        commit("setReadyToShow", false);
    },

    /**
     * Adds a confirmAction object to the queue.
     * @param {object} state state
     * @param {object} newAction alert object to be added to queue
     * @returns {void}
     */
    addSingleAction: function ({state, commit}, newAction) {
        const confirmActionProtoClone = {...state.confirmActionProto};

        for (const key in newAction) {
            confirmActionProtoClone[key] = newAction[key];
        }

        commit("addToActions", confirmActionProtoClone);

        if (state.queue.length > 0) {
            commit("setReadyToShow", true);
        }

        return confirmActionProtoClone;
    }
};
