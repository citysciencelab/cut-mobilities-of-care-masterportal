/**
 * User type definition
 * @typedef {object} GfiState
 * @property {boolean} active - true if the gfi is active
 * @property {?object} currentFeature - the current feature that is displayed
 *
 */
const state = {
    active: false,
    currentFeature: null,
    usePager: true
};

export default state;
