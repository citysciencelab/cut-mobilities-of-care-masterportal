import makePointerMoveHandler from "./makePointerMoveHandler";
import makeUpdateViewState from "./makeUpdateViewState";
import normalizeLayers from "./normalizeLayers";
import getters from "../getters";

let unsubscribes = [],
    loopId = null;

/**
 * When map module is done, the normalized layers should be constructed on the fly when adding layers.
 * For now, these processes happen independently of each other, so we need a hack to get the data.
 * TODO remove this once all layers are added/removed with a mutation
 * @param {object} state state object
 * @param {module:ol/Map} map ol map
 * @returns {void}
 */
function loopLayerLoader (state, map) {
    clearInterval(loopId);
    loopId = setInterval(() => {
        [state.layers, state.layerIds] = normalizeLayers(map.getLayers().getArray());
    }, 5000);
}

const mutations = {
    /**
     * Sets the map to the store. As a side-effect, map-related functions are registered
     * to fire changes when required. Each time a new map is registered, all old listeners
     * are discarded and new ones are registered.
     * @param {object} state state object
     * @param {module:ol/Map} map map object
     * @returns {void}
     */
    setMap (state, map) {
        // discard old listeners
        if (unsubscribes.length) {
            unsubscribes.forEach(unsubscribe => unsubscribe());
            unsubscribes = [];
        }

        const updateState = makeUpdateViewState(state, map),
            mapView = map.getView();

        // set map to store
        state.map = map;

        // update state once initially
        updateState();

        // hack: see comment on function
        loopLayerLoader(state, map);

        // projection (and changing it) probably belongs in a separate space due to complexity?
        state.projection = mapView.getProjection();

        // register listeners with state update functions
        unsubscribes = [
            map.on("moveend", updateState),
            map.on("pointermove", makePointerMoveHandler(state))
        ];
    },
    /**
     * Sets a new zoom level to map and store. All other fields will be updated onmoveend.
     * @param {object} state state object
     * @param {number} zoomLevel zoom level
     * @returns {void}
     */
    setZoomLevel (state, zoomLevel) {
        state.zoomLevel = zoomLevel;
        getters.map(state).getView().setZoom(zoomLevel);
    },
    /**
     * Turns a visible layer invisible and the other way around.
     * @param {object} state state object
     * @param {string} layerId id of the layer to toggle visibility of
     * @returns {void}
     */
    toggleLayerVisibility (state, layerId) {
        const layer = getters.layers(state)[layerId];

        if (layer) {
            const nextVisibility = !layer.olLayer.getVisible();

            layer.olLayer.setVisible(nextVisibility);
            layer.visibility = nextVisibility;
            return;
        }

        console.warn(`No layer with id ${layerId} found to toggle visibility of.`);
    },
    /**
     * Sets the opacity of a layer.
     * @param {object} state state object
     * @param {object} payload parameter object
     * @param {string} payload.layerId id of layer to change opacity of
     * @param {number} payload.value opacity value in range (0, 1)
     * @returns {void}
     */
    setLayerOpacity (state, {layerId, value}) {
        const layer = getters.layers(state)[layerId];

        if (!layer) {
            console.warn(`No layer with id ${layerId} found to set opacity of.`);
            return;
        }

        layer.olLayer.setOpacity(value);
        layer.opacity = value;
    }
};

export default mutations;
