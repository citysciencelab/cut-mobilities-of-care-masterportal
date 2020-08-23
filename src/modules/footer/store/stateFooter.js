/**
 * User type definition
 * @typedef {object} FooterState
 * @property {boolean} showFooter Indicates whether the footer is displayed.
 * @property {object[]} urls Array of URL configuration objects
 * @property {string} urls[].alias Name of the link for desktop playout.
 * @property {string} urls[].alias_mobil Name of the link for mobile application.
 * @property {string} urls[].bezeichnung Name before the link.
 * @property {string} urls[].url The URL to be called.
 * @property {string} urls[].toolModelId The id of the model whose tool should be opened, an url is then not necessary.
 * @property {boolean} showVersionFlag if the version number of the Master Portal should be displayed in the footer.
 */
const state = {
    showFooter: false,
    urls: [],
    showVersion: false
};

export default state;
