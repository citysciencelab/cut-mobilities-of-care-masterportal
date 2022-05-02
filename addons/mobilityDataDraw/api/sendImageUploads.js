import config from "../config";

/**
 * Sends an image uploads to the backend
 *
 * @param {string} entryId the id of the entry to add the image upload to
 * @param {Blob[]} imageUploadBlobs the recorded data to send to the api.
 * @returns {Promise} api response.
 */
function sendImageUploads (entryId, imageUploadBlobs) {
    console.log("doing that image thing")
    if (!entryId) {
        throw Error("Entry ID is missing.");
    }

    const formData = new FormData();

    formData.append("entryId", entryId);

    imageUploadBlobs.forEach((imageUploadBlob, index) => {
        formData.append(
            `image_${index}`,
            imageUploadBlob,
            `${entryId}_image_upload_${index}`
        );
    });

    return fetch(config.API_BASE_URL + "/image", {
        method: "POST",
        body: formData
    }).then(async response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }

        return response;
    });
}

export default {sendImageUploads};
