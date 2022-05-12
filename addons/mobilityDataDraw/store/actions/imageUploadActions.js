
/**
 * Initializes the image uploader
 *
 * @param {Number} imageUploadIndex index of the image to add
 * @returns {void}
 */
function initializeImageUploader ({state, commit}, imageUploadIndex) {
    const imageUploads = state.imageUploads;
    if (imageUploads.length === imageUploadIndex) {
        imageUploads[imageUploadIndex] = null;
    }
    commit("setImageUploads", imageUploads);
}

/**
 * Adds an image upload
 *
 * @param {Object} imageUpload the audio record to add.
 * @returns {void}
 */
function addImageUpload ({state, commit}, payload) {
    const imageUploads = state.imageUploads;
    imageUploads[payload.imageUploadIndex] = payload.chosenFile;
    commit("setImageUploads", imageUploads);
}
/**
 * Removes an image upload
 *
 * @param {Number} imageUploadIndex index of the image to remove.
 * @returns {void}
 */
function removeImageUpload ({state, commit}, imageUploadIndex) {
    const imageUploads = state.imageUploads;
    imageUploads[imageUploadIndex] = null;

    commit("setImageUploads", imageUploads);
}

export default {
    addImageUpload,
    initializeImageUploader,
    removeImageUpload
};
