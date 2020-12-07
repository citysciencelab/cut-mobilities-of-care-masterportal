/**
 * User type definition
 * @typedef {Object} GfiState
 * @property {String} id id of the gfi component
 * @property {String} name displayed as title (config-param)
 * @property {String} glyphicon icon next to title (config-param)
 * @property {Boolean} active - true if the gfi is active
 * @property {Object} currentFeature - the current feature that is displayed
 * @property {String} desktopType - specifies which template is used in desktop mode
 * @property {Boolean} centerMapToClickPoint - specifies if the map should be centered when clicking on a feature
 *
 */
const state = {
    id: "gfi",
    name: "Informationen abfragen",
    glyphicon: "glyphicon-info-sign",
    active: false,
    currentFeature: null,
    desktopType: "",
    centerMapToClickPoint: false,
    showMarker: true,
    highlightVectorRules: null
};

export default state;
