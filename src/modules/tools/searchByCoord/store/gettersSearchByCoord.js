import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import searchByCoordState from "./stateSearchByCoord";

const getters = {
    /**
     * Returns an object of simple getters for a state object, where
     * simple means that they will just return an entry for any key.
     * For example, given a state object {key: value}, an object
     * {key: state => state[key]} will be returned.
     * This is useful to avoid writing basic operations.
     * @param {object} state state to generate getters for
     * @returns {object.<string, function>} object of getters
     */
    ...generateSimpleGetters(searchByCoordState),

    /**
     * Returns true to easting coordinate error variable if one test case fails.
     * @param {Object} state state of this tool
     * @returns {Boolean} true if an error for the coordinate occurs
     */
    getEastingError: state => {
        if (state.eastingNoCoord || state.eastingNoMatch) {
            return true;
        }
        return false;
    },
    /**
     * Returns true to northing coordinate error variable if one test case fails.
     * @param {Object} state state of this tool
     * @returns {Boolean} true if an error for the coordinate occurs
     */
    getNorthingError: state => {
        if (state.northingNoCoord || state.northingNoMatch) {
            return true;
        }
        return false;
    }
};

export default getters;
