import config from "../config.json";

/**
 * Sends an audio record to the backend
 *
 * @param {string} featuresWithId the id of the entry to add the audio record to
 * @param {Blob[]} audioRecords the recorded data to send to the api.
 * @returns {Promise} api response.
 */
function sendAudioRecords (featuresWithId, audioRecords) {
    if (!featuresWithId) {
        throw Error("Entry IDs are missing.");
    }

    // Setting the IDs for the audio records from the already saved features
    for (const featuresWithIdElement of featuresWithId) {
        audioRecords[featuresWithIdElement.geometryIndex].featureId = featuresWithIdElement.featureId;
    }

    const formData = new FormData();

    formData.append("entryId", audioRecords
        .map(audioRecord => audioRecord.featureId).toString());

    audioRecords.forEach((audioRecord, index) => {
        if (audioRecord.audioRecordBlob) {
            formData.append(
                `audio_${audioRecord.featureId}`,
                audioRecord.audioRecordBlob,
                `${audioRecord.featureId}_audio_record_${index}`
            );
        }
    });

    return fetch(config.API_BASE_URL + "/audio", {
        method: "POST",
        body: formData
    }).then(async response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }

        return response;
    });
}

export default {sendAudioRecords};
