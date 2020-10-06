/**
 * User type definition
 * @typedef {object} GfiState
 * @property {boolean} active - true if the gfi is active
 * @property {?object} currentFeature - the current feature that is displayed
 * @property {boolean} showMarker=true - if true, the marker will shown at click-position
 *
 */
const state = {
    active: false,
    currentFeature: null,
    showMarker: true
};

export default state;
