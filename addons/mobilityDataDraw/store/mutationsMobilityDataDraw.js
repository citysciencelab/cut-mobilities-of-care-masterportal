import { generateSimpleMutations } from "../../../src/app-store/utils/generators";
import stateMobilityDataDraw from "./stateMobilityDataDraw";
import config from "../config.json";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateMobilityDataDraw),

    /**
     * If name from config.json starts with "translate#", the corrected key is set to name here.
     * @param {object} state of this component
     * @param {string} payload name of this component
     * @returns {void}
     */
    applyTranslationKey: (state, payload) => {
        if (payload && payload.indexOf("translate#") > -1) {
            state.name = payload.substr("translate#".length);
        }
    },

    /**
     * Setting the isTestEnvironment variable which can be a boolean or string
     * @param {object} state of this component
     * @returns {void}
     */
    applyTestEnv: (state) => {
        const testEnv = config.TEST_ENV;
        if (typeof testEnv === "boolean") {
            state.isTestEnvironment = testEnv;
        } else {
            state.isTestEnvironment = testEnv.toUpperCase() === "TRUE";
        }
    }
};

export default mutations;
