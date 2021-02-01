/**
 * Returns an object of simple mutations for a state object, where
 * simple means that they will just replace an entry for any key.
 * For example, given a state object {key: value}, an object
 * {setKey: (state, payload) => state[key] = payload} will be returned.
 * This is useful to avoid writing basic operations.
 * @param {Object} state state to generate mutations for
 * @returns {Object.<String, Function>} object of mutations
 */
export function generateSimpleMutations (state) {
    return Object.keys(state)
        .reduce((acc, key) => {
            const mutationKey = `set${key[0].toUpperCase()}${key.slice(1)}`;

            return {
                ...acc,
                [mutationKey]: (moduleState, payload) => {
                    moduleState[key] = payload;
                }
            };
        }, {});
}

/**
 * Returns an object of simple getters for a state object, where
 * simple means that they will just return an entry for any key.
 * For example, given a state object {key: value}, an object
 * {key: state => state[key]} will be returned.
 * This is useful to avoid writing basic operations.
 * @param {Object} state state to generate getters for
 * @returns {Object.<String, Function>} object of getters
 */
export function generateSimpleGetters (state) {
    return Object.keys(state)
        .reduce((acc, key) => ({
            ...acc,
            [key]: s => s[key]
        }), {});
}
