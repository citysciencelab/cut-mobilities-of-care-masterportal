import drawAndModifyActions from "./actions/drawAndModifyActions";
import personalDataActions from "./actions/personalDataActions";
import dailyRoutineActions from "./actions/dailyRoutineActions";
import annotationsActions from "./actions/annotationsActions";
import audioRecorderActions from "./actions/audioRecorderActions";
import stateMobilityDataDraw from "./stateMobilityDataDraw";

import personApi from "../api/sendPersonalData";
import entryApi from "../api/sendEntry";
import audioApi from "../api/sendAudioRecords";

const initialState = JSON.parse(JSON.stringify(stateMobilityDataDraw)),
    actions = {
        ...drawAndModifyActions,
        ...personalDataActions,
        ...dailyRoutineActions,
        ...annotationsActions,
        ...audioRecorderActions,

        /**
         * Submits personal data
         *
         * @param {Object} context actions context object.
         * @returns {Promise<void>} transmission success.
         */
        submitPersonalData ({state, commit}) {
            return personApi
                .sendPersonalData(state.personalData)
                .then(({personId}) => {
                    commit("setPersonId", personId);
                })
                .catch(error => {
                    console.error(error);
                    Radio.trigger("Alert", "alert", {
                        text: i18next.t(
                            "additional:modules.tools.mobilityDataDraw.alert.submitPersonalDataError"
                        ),
                        category: "Error",
                        kategorie: "alert-danger"
                    });
                });
        },

        /**
         * Stops drawing and submits the drawn data
         *
         * @param {Object} context actions context object.
         * @returns {Promise<void>} transmission success.
         */
        submitDrawnData ({state}) {
            const entry = {
                personId: state.personId,
                description: state.summary,
                weekdays: state.weekdays,
                mobilityFeatures: state.mobilityData,
                annotationFeatures: state.annotations
            };

            return entryApi
                .sendEntry(entry)
                .then(({entryId}) => {
                    const audioRecordBlobs = state.audioRecords
                        .map(audioRecord => audioRecord.audioRecordBlob)
                        .filter(Boolean);
                    if (audioRecordBlobs.length) {
                        audioApi
                            .sendAudioRecords(entryId, audioRecordBlobs)
                            .catch(error => {
                                console.error(error);
                                Radio.trigger("Alert", "alert", {
                                    text: i18next.t(
                                        "additional:modules.tools.mobilityDataDraw.alert.submitAudioError"
                                    ),
                                    category: "Error",
                                    kategorie: "alert-danger"
                                });
                            });
                    }
                })
                .catch(error => {
                    console.error(error);
                    Radio.trigger("Alert", "alert", {
                        text: i18next.t(
                            "additional:modules.tools.mobilityDataDraw.alert.submitMobilityDataError"
                        ),
                        category: "Error",
                        kategorie: "alert-danger"
                    });
                });
        },

        /**
         * Resets the drawn mobility data.
         *
         * @param {Object} context actions context object.
         * @returns {void}
         */
        resetDrawnData ({state, commit}) {
            // Reset mobility data
            commit("setMobilityMode", initialState.mobilityMode);
            commit("setWeekdays", initialState.weekdays);
            commit("setMobilityData", initialState.mobilityData);
            commit("setSummary", initialState.summary);

            // Reset annotations
            commit("setDrawingMode", initialState.drawingMode);
            commit("setAnnotations", initialState.annotations);

            // Reset audio record
            commit("setAudioRecordBlob", initialState.audioRecordBlob);

            // Clear map layers
            if (state.mobilityDataLayer) {
                state.mobilityDataLayer.getSource().clear();
            }
            if (state.annotationsLayer) {
                state.annotationsLayer.getSource().clear();
            }
        },

        /**
         * Resets the Mobility Data Draw Tool.
         *
         * @param {Object} context actions context object.
         * @returns {void}
         */
        resetModule ({commit, dispatch}) {
            // Remove interactions from the map
            dispatch("removeModifyInteraction");
            dispatch("removeSnapInteraction");

            // Reset drawn data
            dispatch("resetDrawnData");

            // Reset personal data
            commit("setPersonalData", initialState.personalData);
            commit("setPersonId", initialState.personId);

            // Reset view
            commit("setView", initialState.view);
        }
    };

export default actions;
