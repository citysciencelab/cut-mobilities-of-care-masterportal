import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import OrientationState from "./stateOrientation";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => tate[key] = payload}
     * will be returned.
     */
    ...generateSimpleMutations(OrientationState),

    /**
     * Set the ShowPoi Window
     * @param {Object} state - the orientation state
     * @param {Boolean} active - the status of poi window
     * @returns {void}
     */
    setShowPoi (state, active) {
        state.showPoi = active;
    },

    /**
     * Set the ShowPoiIcon
     * @param {Object} state - the orientation state
     * @param {Boolean} active - the status of poi icon
     * @returns {void}
     */
    setShowPoiIcon (state, active) {
        state.showPoiIcon = active;
    },

    /**
     * Set the ShowPoiChoice
     * @param {Object} state - the orientation state
     * @param {Boolean} active - the status of poi icon Choice
     * @returns {void}
     */
    setShowPoiChoice (state, active) {
        state.showPoiChoice = active;
    },

    /**
     * Set the current poi mode
     * @param {Object} state - the orientation state
     * @param {String} option - the mode of poi
     * @returns {void}
     */
    setPoiMode (state, option) {
        state.poiMode = option;
    },

    /**
     * Set the status if poi mode is current position
     * @param {Object} state - the orientation state
     * @param {String} enabled - the status if current position enabled
     * @returns {void}
     */
    setCurrentPositionEnabled (state, enabled) {
        state.poiModeCurrentPositionEnabled = enabled;
    },

    /**
     * Set the Geolocation
     * @param {Object} state - the orientation state
     * @param {ol/geolocation} geolocation - the geolocation
     * @returns {void}
     */
    setGeolocation (state, geolocation) {
        state.geolocation = geolocation;
    },

    /**
     * Set the center position of Geolocation
     * @param {Object} state - the orientation state
     * @param  {Array} position the center position
     * @returns {void}
     */
    setPosition (state, position) {
        state.position = position;
    },

    /**
     * Set the active category for poi tab
     * @param {Object} state - the orientation state
     * @param  {String} activeCategory the active category
     * @returns {void}
     */
    setActiveCategory (state, activeCategory) {
        state.activeCategory = activeCategory;
    }
};

export default mutations;
