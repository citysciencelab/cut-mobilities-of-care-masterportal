/**
 * Adds an audio record
 *
 * @param {Object} imageUpload the audio record to add.
 * @returns {void}
 */
function addImageUpload ({state, commit}, imageUpload) {
    //commit("setImageUpload", imageUpload);

    commit("setImageUploads", [...state.imageUploads, imageUpload]);
}

export default {
    addImageUpload
};
