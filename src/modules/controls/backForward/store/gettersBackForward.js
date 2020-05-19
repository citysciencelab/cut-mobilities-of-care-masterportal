export default {
    /**
     * @param {object} state module state
     * @returns {boolean} whether a previous memory exists
     */
    backAvailable: state => state.position === null ? false : typeof state.memory[state.position - 1] === "object",
    /**
     * @param {object} state module state
     * @returns {boolean} whether a next memory exists
     */
    forthAvailable: state => state.position === null ? false : typeof state.memory[state.position + 1] === "object"
};
