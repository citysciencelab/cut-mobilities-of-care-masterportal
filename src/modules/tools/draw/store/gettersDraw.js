import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateDraw";

const getters = {
    ...generateSimpleGetters(initialState),

    /**
     * returns a clone of the current drawTypeSettings
     *
     * @param {Object} state the state dipendency
     * @returns {Object} the cloned current drawTypeSettings
     */
    getStyleSettings (state) {
        return () => {
            const stateKey = state.drawType.id + "Settings";

            return JSON.parse(JSON.stringify(state[stateKey]));
        };
    }
};

export default getters;
