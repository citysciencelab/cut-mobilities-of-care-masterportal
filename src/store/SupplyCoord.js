export default {
    namespaced: true,
    state: {
        active: false,
        // change this to render in window or in sidebar
        renderToWindow: false,
        id: "coord",
        title: "Koordinaten abfragen",
        deactivateGFI: true,
        glyphicon: "glyphicon-screenshot",
        // SupplyCoord specific:
        selectPointerMove: null,
        projections: [],
        mapProjection: null,
        positionMapProjection: [],
        updatePosition: true,
        currentProjectionName: "EPSG:25832",
        currentSelection: "EPSG:4326"
    },

    mutations: {
        active (state, value) {
            state.active = value;
        },
        renderToWindow (state, value) {
            state.renderToWindow = value;
        },
        positionMapProjection (state, value) {
            state.positionMapProjection = value;
        },
        projections (state, value) {
            state.projections = value;
        },
        selectPointerMove (state, value) {
            state.selectPointerMove = value;
        },
        updatePosition (state, value) {
            state.updatePosition = value;
        },
        mapProjection (state, value) {
            state.mapProjection = value;
        },
        currentProjectionName (state, value) {
            state.currentProjectionName = value;
        },
        currentSelection (state, value) {
            state.currentSelection = value;
        }
    }
};
