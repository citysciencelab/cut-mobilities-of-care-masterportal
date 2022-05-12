/**
 * Adds an audio record
 *
 * @param {Object} audioRecord the audio record to add.
 * @returns {void}
 */
function addAudioRecord ({state, commit}, audioRecord) {
    commit("setAudioRecords", [...state.audioRecords, audioRecord]);
}

/**
 * Removes an audio record
 *
 * @param {Number} audioRecordIndex index of the audio record to remove.
 * @returns {void}
 */
function removeAudioRecord ({state, commit}, audioRecordIndex) {
    const audioRecords = state.audioRecords;
    audioRecords[audioRecordIndex].audioRecordBlob = null;

    commit("setAudioRecords", audioRecords);
}

/**
 * Initializes the audio recorder
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function initializeAudioRecorder ({state, commit}, audioRecordId) {
    if (state.audioRecords.length === audioRecordId) {
        state.audioRecords.push(
            {
                audioRecordBlob: null,
                isRecording: false,
                geometryIndex: audioRecordId
            }
        );
    }
    // Get audio stream from the user's microphone
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        let {audioRecorder} = state

        if (!state.audioRecorder) {
            audioRecorder = new MediaRecorder(stream);
            commit("setAudioRecorder", audioRecorder);
        }
        // Listen to the `dataavailable` event, which gets triggered whenever
        // we have an audio blob available
        audioRecorder.addEventListener("dataavailable", event => {
            const audioRecords = state.audioRecords.map(audioRecord => {
                if (audioRecord.isRecording) {
                    audioRecord.audioRecordBlob = event.data;
                    audioRecord.isRecording = false;
                }
                return audioRecord;
            })
            commit("setAudioRecords", [...audioRecords]);
        });
    });
}

/**
 * Stops the current audio stream and removes the audio recorder
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function destroyAudioRecorder ({state, commit}) {
    const {audioRecorder} = state;
    if (!audioRecorder) {
        return;
    }

    audioRecorder.stream.getTracks().forEach(track => track.stop());
    commit("setAudioRecorder", null);
}

/**
 * Starts recording
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function startRecording ({state, commit}, audioRecordIndex) {
    const {audioRecorder} = state;
    if (audioRecorder) {
        audioRecorder.start();
        const audioRecord = state.audioRecords[audioRecordIndex];
        audioRecord.isRecording = true;
        commit("setAudioRecords", [...state.audioRecords]);
    }
}

/**
 * Stops recording
 * This will trigger the `dataavailable` event
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function stopRecording ({state}) {
    const {audioRecorder} = state;
    if (audioRecorder) {
        audioRecorder.stop();
    }
}

export default {
    addAudioRecord,
    removeAudioRecord,
    initializeAudioRecorder,
    destroyAudioRecorder,
    startRecording,
    stopRecording
};
