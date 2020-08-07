const mutations = {
    /**
     * Sets config.json.
     * @param {object} state store state
     * @param {object} config config.json
     * @returns {void}
     */
    setConfigJson (state, config) {
        state.configJson = config;
    },
    /**
     * Sets config.js.
     * @param {object} state store state
     * @param {object} config config.js
     * @returns {void}
     */
    setConfigJs (state, config) {
        state.configJs = config;
    },
    /**
     * Sets mobile flag.
     * @param {object} state store state
     * @param {boolean} mobile whether browser resolution indicates mobile device
     * @returns {void}
     */
    setMobile (state, mobile) {
        state.mobile = mobile;
    },
    /**
     * Sets i18NextInitialized flag. Is done after languages for addons are loaded.
     * @param {object} state store state
     * @param {boolean} isInitialized whether i18Next is initialized
     * @returns {void}
     */
    setI18Nextinitialized (state, isInitialized) {
        state.i18NextInitialized = isInitialized;
    }
};

export default mutations;
