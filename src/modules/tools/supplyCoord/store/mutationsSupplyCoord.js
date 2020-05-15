export default {
    active (state, value) {
        state.active = value;
    },
    currentProjectionName (state, value) {
        state.currentProjectionName = value;
    },
    currentSelection (state, value) {
        state.currentSelection = value;
    },
    mapProjection (state, value) {
        state.mapProjection = value;
    },
    positionMapProjection (state, value) {
        state.positionMapProjection = value;
    },
    projections (state, value) {
        state.projections = value;
    },
    // NOTE commented out for composeModules test
    // renderToWindow (state, value) {
    //     state.renderToWindow = value;
    // },
    selectPointerMove (state, value) {
        state.selectPointerMove = value;
    },
    updatePosition (state, value) {
        state.updatePosition = value;
    }
};
