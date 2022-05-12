import config from "../config";

/**
 * Sends an image uploads to the backend
 *
 * @param {string} featuresWithId the id of the entry to add the image upload to
 * @param {Blob[]} uploadedImages the recorded data to send to the api.
 * @returns {Promise} api response.
 */
function sendImageUploads (featuresWithId, uploadedImages) {
    if (!featuresWithId) {
        throw Error("Entry ID is missing.");
    }

    const formData = new FormData();
    formData.append("entryId", featuresWithId
        .map(feature => feature.featureId).toString());

    uploadedImages.forEach((uploadedImage, index) => {
        if (uploadedImage) {
            const id = featuresWithId[index].featureId;
            formData.append(
                `image_${id}`,
                uploadedImage,
                `${id}_image_upload_${index}`
            );
        }
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
