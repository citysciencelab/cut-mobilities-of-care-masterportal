import drawAndModifyActions from "./actions/drawAndModifyActions";
import personalDataActions from "./actions/personalDataActions";
import dailyRoutineActions from "./actions/dailyRoutineActions";
import annotationsActions from "./actions/annotationsActions";
import audioRecorderActions from "./actions/audioRecorderActions";
import imageUploadActions from "./actions/imageUploadActions";
import stateMobilityDataDraw from "./stateMobilityDataDraw";

import personApi from "../api/sendPersonalData";
import entryApi from "../api/sendEntry";
import audioApi from "../api/sendAudioRecords";
import imageApi from "../api/sendImageUploads";

import config from "../config.json";

const initialState = JSON.parse(JSON.stringify(stateMobilityDataDraw)),
    actions = {
        ...drawAndModifyActions,
        ...personalDataActions,
        ...dailyRoutineActions,
        ...annotationsActions,
        ...audioRecorderActions,
        ...imageUploadActions,

        /**
         * Submits personal data
         *
         * @param {Object} context actions context object.
         * @returns {Promise<void>} transmission success.
         */
        submitPersonalData ({state, commit}) {
            if (state.personId) {
                state.personalData.personId = state.personId;
            }
            return personApi
                .sendPersonalData(state.personalData)
                .then(({personId}) => {
                    commit("setPersonId", personId);
                })
                .catch(error => {
                    console.error(error);
                    Radio.trigger("Alert", "alert", {
                        text: i18next.t(
                            config.TEST_ENV ?
                                "additional:modules.tools.testMode.noDataSent" :
                                "additional:modules.tools.mobilityDataDraw.alert.submitPersonalDataError"
                        ),
                        category: config.TEST_ENV ? i18next.t("additional:modules.tools.testMode.hint") : "Error",
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
                .then((featuresWithId) => {
                    const audioRecordBlobs = state.audioRecords
                        .map(audioRecord => audioRecord.audioRecordBlob)
                        .filter(Boolean);
                    const audioRecordings = state.audioRecords;
                    if (audioRecordBlobs.length) {
                        audioApi
                            .sendAudioRecords(featuresWithId, audioRecordings)
                            .catch(error => {
                                console.error(error);
                                Radio.trigger("Alert", "alert", {
                                    text: i18next.t(
                                        config.TEST_ENV ?
                                            "additional:modules.tools.testMode.noDataSent" :
                                            "additional:modules.tools.mobilityDataDraw.alert.submitAudioError"
                                    ),
                                    category: config.TEST_ENV ? i18next.t("additional:modules.tools.testMode.hint") : "Error",
                                    kategorie: "alert-danger"
                                });
                            });
                    }
                    const uploadedImages = state.imageUploads;
                    if (uploadedImages.filter(Boolean).length) {
                        imageApi
                            .sendImageUploads(featuresWithId, uploadedImages)
                            .catch(error => {
                                console.error(error);
                                Radio.trigger("Alert", "alert", {
                                    text: i18next.t(
                                        config.TEST_ENV ?
                                            "additional:modules.tools.testMode.noDataSent" :
                                            "additional:modules.tools.mobilityDataDraw.alert.submitAudioError"
                                    ),
                                    category: config.TEST_ENV ? i18next.t("additional:modules.tools.testMode.hint") : "Error",
                                    kategorie: "alert-danger"
                                });
                            });
                    }
                })
                .catch(error => {
                    console.error(error);
                    Radio.trigger("Alert", "alert", {
                        text: i18next.t(
                            config.TEST_ENV ?
                                "additional:modules.tools.testMode.noDataSent" :
                                "additional:modules.tools.mobilityDataDraw.alert.submitMobilityDataError"
                        ),
                        category: config.TEST_ENV ? i18next.t("additional:modules.tools.testMode.hint") : "Error",
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
            this.destroyAudioRecorder();

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
        },

        setResizableWindow ({commit}, resizable) {
            commit("setResizableWindow", resizable);
        }

    };

export default actions;
