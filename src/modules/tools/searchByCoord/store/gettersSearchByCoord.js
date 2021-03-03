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
        return Boolean(state.eastingNoCoord || state.eastingNoMatch);
    },
    /**
     * Returns true to northing coordinate error variable if one test case fails.
     * @param {Object} state state of this tool
     * @returns {Boolean} true if an error for the coordinate occurs
     */
    getNorthingError: state => {
        return Boolean(state.northingNoCoord || state.northingNoMatch);
    },
    /**
     * Returns the label name depending on the selected coordinate system.
     * @param {Object} state state of this tool
     * @param {String} key in the language files
     * @returns {String} the name of the label
     */
    getLabel: (state) => (key) => {
        const type = state.currentSelection === "ETRS89" ? "cartesian" : "hdms";

        return "modules.tools.searchByCoord." + type + "." + key;
    }
};

export default getters;
