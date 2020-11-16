export default {
    /**
     * @param {Object} state module state
     * @returns {Boolean} whether a previous memory exists
     */
    backAvailable: state => state.position === null ? false : typeof state.memory[state.position - 1] === "object",
    /**
     * @param {Object} state module state
     * @returns {Boolean} whether a next memory exists
     */
    forthAvailable: state => state.position === null ? false : typeof state.memory[state.position + 1] === "object"
};
