let unsubscribes = [];

/**
 * @param {object} state state object
 * @param {module:ol/Map} map openlayer map object
 * @returns {function} update function for state parts to update onmoveend
 */
function makeUpdateState (state, map) {
    return () => {
        const mapView = map.getView();

        state.zoomLevel = mapView.getZoom();
        state.maxZoomLevel = mapView.getMaxZoom();
        state.minZoomLevel = mapView.getMinZoom();
        state.resolution = mapView.getResolution();
        state.maxResolution = mapView.getMaxResolution();
        state.minResolution = mapView.getMinResolution();
        state.bbox = mapView.calculateExtent(map.getSize());
        state.rotation = mapView.getRotation();
        state.scale = 5; // TODO
        state.center = mapView.getCenter();
    };
}

/**
 * @param {object} state state object
 * @returns {function} update function for mouse coordinate
 */
function makePointerMoveHandler (state) {
    return (evt) => {
        if (evt.dragging) {
            return;
        }
        state.mouseCoord = evt.coordinate;
    };
}

const mutations = {
    setMap (state, map) {
        if (unsubscribes.length) {
            unsubscribes.forEach(unsubscribe => unsubscribe());
            unsubscribes = [];
        }

        const updateState = makeUpdateState(state, map),
            mapView = map.getView();

        state.map = map;
        updateState();

        // TODO how to change projection?
        state.projection = mapView.getProjection();

        unsubscribes = [
            map.on("moveend", updateState),
            map.on("pointermove", makePointerMoveHandler(state))
        ];
    },
    setZoomLevel (state, zoomLevel) {
        state.zoomLevel = zoomLevel;
        state.map.getView().setZoom(zoomLevel);
    }
};

export default mutations;
