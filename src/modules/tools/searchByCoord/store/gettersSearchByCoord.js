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
    ...generateSimpleGetters(searchByCoordState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
