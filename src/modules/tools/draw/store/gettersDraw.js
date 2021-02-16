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
    styleSettings (state) {
        const stateKey = state.drawType.id + "Settings";

        return JSON.parse(JSON.stringify(state[stateKey]));
    },
    /**
     * If no features are present or the filename or the format is not set, the download is disabled.
     *
     * @param {Object} state state Current state object of the store.
     * @returns {Boolean} Whether to activate or deactivate the Download Button.
     */
    disableFileDownload (state) {
        const {features, fileName, selectedFormat} = state.download;

        return features.length === 0 || fileName === "" || selectedFormat === "" || selectedFormat === "none";
    }
};

export default getters;
