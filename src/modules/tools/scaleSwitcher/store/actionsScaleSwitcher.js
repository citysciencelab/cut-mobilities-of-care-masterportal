/** @const {String} [Path array of possible config locations. First one found will be used] */
/** @const {object} [vue actions] */
const actions = {
    /**
    * Sets the active property of the state to the given value.
    * Also starts processes if the tool is be activated (active === true).
    * @param {boolean} active Value deciding whether the tool gets activated or deactivated.
    * @returns {void}
    */
    setActive ({commit}, active) {
        commit("setActive", active);
    }
};

export default actions;
