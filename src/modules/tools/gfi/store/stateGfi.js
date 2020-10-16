/**
 * User type definition
 * @typedef {object} GfiState
 * @property {String} id id of the gfi component
 * @property {String} name displayed as title (config-param)
 * @property {String} glyphicon icon next to title (config-param)
 * @property {boolean} active - true if the gfi is active
 * @property {?object} currentFeature - the current feature that is displayed
 *
 */
const state = {
    id: "gfi",
    name: "Informationen abfragen",
    glyphicon: "glyphicon-info-sign",
    active: false,
    currentFeature: null
};

export default state;
