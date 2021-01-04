import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import initialState from "./stateDraw";

const getters = {
    ...generateSimpleGetters(initialState),

    /**
     * Returns a clone of the current drawTypeSettings
     *
     * @param {Object} state Current state object of the store.
     * @returns {Object} The cloned current drawTypeSettings
     */
    getStyleSettings (state) {
        return () => { // TODO(roehlipa): Is there a reason why this is wrapped in a function?
            const stateKey = state.drawType.id + "Settings";

            return JSON.parse(JSON.stringify(state[stateKey]));
        };
    }
};

export default getters;
