import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import mobilityDataDrawState from "./stateMobilityDataDraw";

const getters = {
    ...generateSimpleGetters(mobilityDataDrawState),

    /**
     * Get number of actually recorded audio files
     * @param {object} state of this component
     * @returns {int} number of actual audio recordings
     */
    getNumberOfRecordings: (state) => {
        let numberRecordings = 0;

        for (const record of state.audioRecords) {
            numberRecordings = record.audioRecordBlob !== null ? numberRecordings + 1 : numberRecordings;
        }
        return numberRecordings;
    }
};

export default getters;
