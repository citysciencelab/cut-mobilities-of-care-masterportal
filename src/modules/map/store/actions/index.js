import makePointerMoveHandler from "./makePointerMoveHandler";
import makeUpdateViewState from "./makeUpdateViewState";
import normalizeLayers from "./normalizeLayers";

let unsubscribes = [],
    loopId = null;

/**
 * When map module is done, the normalized layers should be constructed on the fly when adding layers.
 * For now, these processes happen independently of each other, so we need a hack to get the data.
 * TODO remove this once all layers are added/removed with an action (~= replace map.js with this module)
 * @param {function} commit commit function
 * @param {module:ol/Map} map ol map
 * @returns {void}
 */
function loopLayerLoader (commit, map) {
    clearInterval(loopId);
    loopId = setInterval(() => {
        const [layers, layerIds] = normalizeLayers(map.getLayers().getArray());

        commit("setLayers", layers);
        commit("setLayerIds", layerIds);
    }, 5000);
}

const actions = {
    /**
     * Sets the map to the store. As a side-effect, map-related functions are registered
     * to fire changes when required. Each time a new map is registered, all old listeners
     * are discarded and new ones are registered.
     * @param {object} state state object
     * @param {module:ol/Map} map map object
     * @returns {void}
     */
    setMap ({commit, rootGetters}, {map}) {
        // discard old listeners
        if (unsubscribes.length) {
            unsubscribes.forEach(unsubscribe => unsubscribe());
            unsubscribes = [];
        }

        const updateState = makeUpdateViewState(commit, map, rootGetters.dpi),
            mapView = map.getView();

        // set map to store
        commit("setMap", map);

        // update state once initially to get initial settings
        updateState();

        // hack: see comment on function
        loopLayerLoader(commit, map);

        // currently has no change mechanism
        commit("setProjection", mapView.getProjection());

        // register listeners with state update functions
        unsubscribes = [
            map.on("moveend", updateState),
            map.on("pointermove", makePointerMoveHandler(commit))
        ];
    },
    /**
     * Sets a new zoom level to map and store. All other fields will be updated onmoveend.
     * @param {object} state state object
     * @param {number} zoomLevel zoom level
     * @returns {void}
     */
    setZoomLevel ({getters, commit}, zoomLevel) {
        getters.map.getView().setZoom(zoomLevel);
        commit("setZoomLevel", zoomLevel);
    },
    /**
     * Turns a visible layer invisible and the other way around.
     * @param {object} state state object
     * @param {string} layerId id of the layer to toggle visibility of
     * @returns {void}
     */
    toggleLayerVisibility ({getters, commit}, {layerId}) {
        const layer = getters.layers[layerId];

        if (layer) {
            const nextVisibility = !layer.olLayer.getVisible();

            layer.olLayer.setVisible(nextVisibility);
            commit("setLayerVisibility", {layerId, visibility: nextVisibility});
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
    setLayerOpacity ({getters, commit}, {layerId, value}) {
        const layer = getters.layers[layerId];

        if (!layer) {
            console.warn(`No layer with id ${layerId} found to set opacity of.`);
            return;
        }

        layer.olLayer.setOpacity(value);
        commit("setLayerOpacity", {layerId, opacity: value});
    }
};

export default actions;
