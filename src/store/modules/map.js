let unsubscribeMoveEnd = null;

/**
        ✨  CONCEPT
        Use Vuex as abstraction layer for map.

    Pro:
        - One source for the whole UI, pull complexity from UI.
        - Flow of data is straightforward; if not, one knows where to look.
        - Don't do anything on ol/Map instance twice across components - faster code?
        - ... ?
    Con:
        - May be difficult to code, depending on task at hand ...
        - May lead to sync mistakes and infinite loops.
        - Would probably become a big module that's about copying/syncing.
        - ... ?

    PoC:
        - Done for zoom level, which is probably the easiest by far.
        - Not used (except to get the map object) in BackForward for comparison.

        ________________
        |              |
        |     UI       |
        |______________|
             |     ^
    mutation |     | getter
             v     |
        ___________________
        |                 |
        | VueX Map Module |
        |_________________|
            |     ^ .on-functions registered to mutations, if they exist;
    setters |     | where they do not exist, all access must run via VueX mutations
            v     | to ensure VueX/Map are kept in sync, else VueX may have old state
        ________________
        |              |
        |    Map       |
        |______________|

    TODO: Discuss whether this is a desirable way of coding.
*/
export default {
    name: "mapInstance",
    namespaced: true,
    state: {
        map: null,
        zoomLevel: null,
        /* NOTE should there ever be a setter for these, the state must
         * be updated by that setter since ol does not fire any change
         * event on setMaxZoom/setMinZoom. */
        maxZoomLevel: null,
        minZoomLevel: null
    },
    getters: {
        map: state => state.map,
        zoomLevel: state => state.zoomLevel,
        maxZoomLevel: state => state.maxZoomLevel,
        minZoomLevel: state => state.minZoomLevel
    },
    mutations: {
        setMap (state, map) {
            if (unsubscribeMoveEnd) {
                unsubscribeMoveEnd();
                unsubscribeMoveEnd = null;
            }

            const mapView = map.getView();

            state.map = map;
            state.zoomLevel = mapView.getZoom();
            state.maxZoomLevel = mapView.getMaxZoom();
            state.minZoomLevel = mapView.getMinZoom();

            unsubscribeMoveEnd = map.on("moveend", function () {
                state.zoomLevel = map.getView().getZoom();
            });
        },
        setZoomLevel (state, zoomLevel) {
            state.zoomLevel = zoomLevel;
            state.map.getView().setZoom(zoomLevel);
        }
    }
};
