/**
 * Specifies a view state.
 * @typedef {object} ViewMemory
 * @property {Number} zoom a zoom level
 * @property {[Number, Number]} center a coordinate
 */

/**
 * @param {object} state state object
 * @param {module:ol/Map} map openlayers map object
 * @param {number} diff indices to move by
 * @returns {void} updates map and state as side-effect
 */
function changeActiveMemory (state, map, diff) {
    const {memory, position} = state,
        targetIndex = position === null ? null : position + diff;

    if (targetIndex !== null) {
        const view = map.getView(),
            {center, zoom} = memory[targetIndex];

        view.setZoom(zoom);
        view.setCenter(center);
        state.position = targetIndex;
    }
}

export default {
    namespaced: true,
    state: {
        position: null,
        memory: []
    },
    mutations: {
        /**
         * Memorizes a ViewMemory and moves to it.
         * At most 10 ViewMemory objects are kept, discarding oldest.
         * When memorizing while not on last position, following memories are discarded.
         * @param {object} state module state
         * @param {module:ol/Map} map ol map object
         * @returns {void}
         */
        memorize (state, map) {
            const view = map.getView(),
                current = state.position === null ? null : state.memory[state.position],
                upToNext = state.position === null ? [] : state.memory.slice(0, state.position + 1),
                next = {
                    center: view.getCenter(),
                    zoom: view.getZoom()
                };

            // do not memorize the same information twice (may happen onmoveend when going back/forth)
            if (current &&
                current.zoom === next.zoom &&
                current.center[0] === next.center[0] &&
                current.center[1] === next.center[1]) {
                return;
            }

            let nextMemory = [...upToNext, next];

            if (nextMemory.length > 10) {
                nextMemory = nextMemory.slice(1);
            }
            else {
                state.position = state.position === null ? 0 : state.position + 1;
            }

            state.memory = nextMemory;
        },
        /**
         * Changes view and state to next memory.
         * @param {object} state module state
         * @param {module:ol/Map} map ol map object
         * @returns {void}
         */
        forward (state, map) {
            changeActiveMemory(state, map, +1);
        },
        /**
         * Changes view and state to previous memory.
         * @param {object} state module state
         * @param {module:ol/Map} map ol map object
         * @returns {void}
         */
        backward (state, map) {
            changeActiveMemory(state, map, -1);
        }
    },
    getters: {
        /**
         * @param {object} state module state
         * @returns {boolean} whether a previous memory exists
         */
        backAvailable: state => state.position === null ? false : typeof state.memory[state.position - 1] === "object",
        /**
         * @param {object} state module state
         * @returns {boolean} whether a next memory exists
         */
        forthAvailable: state => state.position === null ? false : typeof state.memory[state.position + 1] === "object"
    }
};
