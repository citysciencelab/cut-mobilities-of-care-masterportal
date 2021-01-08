import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import searchByCoordState from "./stateSearchByCoord";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(searchByCoordState),
    /**
     * Sets the current coordinate System to state.
     * @param {Object} state the state of searchByCoord-module
     * @param {String} selectedCoordSystem - currently selected coordinate System
     * @returns {void}
     */
    setCoordinateSystem: (state, selectedCoordSystem) => {
        state.currentSelection = selectedCoordSystem;
    },
    /**
     * Sets the example values to state.
     * @param {Object} state the state of searchByCoord-module
     * @returns {void}
     */
    setExample (state) {
        if (state.currentSelection === "ETRS89") {
            state.coordinatesEastingExample = "564459.13";
            state.coordinatesNorthingExample = "5935103.67";
        }
        else if (state.currentSelection === "WGS84") {
            state.coordinatesEastingExample = "53° 33′ 25″";
            state.coordinatesNorthingExample = "9° 59′ 50″";
        }
        else if (state.currentSelection === "WGS84(Dezimalgrad)") {
            state.coordinatesEastingExample = "53.55555°";
            state.coordinatesNorthingExample = "10.01234°";
        }
    },
    /**
     * Resets the selectedCoordinates Array in the state.
     * @param {Object} state the state of searchByCoord-module
     * @returns {void}
     */
    resetSelectedCoordinates: (state) => {
        state.selectedCoordinates = [];
    },
    /**
     * Resets the error messages in the state.
     * @param {Object} state the state of searchByCoord-module
     * @returns {void}
     */
    resetErrorMessages: (state) => {
        state.coordinatesEasting.errorMessage = "";
        state.coordinatesNorthing.errorMessage = "";
    },
    /**
     * Pushes the coordinates to selectedCoordinates Array in the state.
     * @param {Object} state the state of searchByCoord-module
     * @param {Object} payload payload object.
     * @returns {void}
     */
    pushCoordinates: (state, payload) => {
        state.selectedCoordinates.push(payload);
    }
};

export default mutations;
