/**
 * updates map and state as side-effect
 * @param {Object} state state object
 * @param {module:ol/Map} map openlayers map object
 * @param {Number} diff indices to move by
 * @returns {void}
 */
function changeActiveMemory (state, map, diff) {
    const {memory, position} = state,
        targetIndex = position === null ? null : position + diff;

    if (targetIndex !== null) {
        if (memory[targetIndex]) {
            const view = map.getView(),
                {center, zoom} = memory[targetIndex];

            view.setZoom(zoom);
            view.setCenter(center);
            state.position = targetIndex;
        }
        else {
            console.error(`Tried to change active backForward memory by ${diff} positions, but such a memory does not exist in memory ${JSON.stringify(memory)}`);
        }
    }
}

export default {
    /**
     * Memorizes a ViewMemory and moves to it.
     * At most 10 ViewMemory objects are kept, discarding oldest.
     * When memorizing while not on last position, following memories are discarded.
     * @param {Object} state module state
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
     * @param {Object} state module state
     * @param {module:ol/Map} map ol map object
     * @returns {void}
     */
    forward (state, map) {
        changeActiveMemory(state, map, +1);
    },
    /**
     * Changes view and state to previous memory.
     * @param {Object} state module state
     * @param {module:ol/Map} map ol map object
     * @returns {void}
     */
    backward (state, map) {
        changeActiveMemory(state, map, -1);
    }
};
