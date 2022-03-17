import config from "../config";

/**
 * Sends an audio record to the backend
 *
 * @param {string} entryId the id of the entry to add the audio record to
 * @param {Blob[]} audioRecordBlobs the recorded data to send to the api.
 * @returns {Promise} api response.
 */
function sendAudioRecords (entryId, audioRecordBlobs) {
    if (!entryId) {
        throw Error("Entry ID is missing.");
    }

    const formData = new FormData();

    formData.append("entryId", entryId);

    audioRecordBlobs.forEach((audioRecordBlob, index) => {
        formData.append(
            `audio_${index}`,
            audioRecordBlob,
            `${entryId}_audio_record_${index}`
        );
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
