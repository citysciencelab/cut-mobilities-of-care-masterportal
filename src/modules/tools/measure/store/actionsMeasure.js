import source from "../util/measureSource";
import makeDraw2d from "../util/measureDraw";
import makeDraw3d from "../util/measureDraw3d";

export default {
    /**
     * Deletes all geometries from the measure layer,
     * and removes belonging UI/state.
     * @return {void}
     */
    deleteFeatures ({state, commit, rootGetters}) {
        const {overlays, unlisteners, interaction} = state,
            map = rootGetters["Map/map"];

        if (interaction) {
            interaction.abortDrawing();
        }
        overlays.forEach(({vueInstance, overlay}) => {
            vueInstance.$destroy();
            map.removeOverlay(overlay);
        });
        unlisteners.forEach(unlistener => unlistener());
        source.clear();

        commit("setLines", {});
        commit("setPolygons", {});
        commit("setOverlays", []);
        commit("setUnlisteners", []);
    },
    /**
     * Creates a new draw interaction depending on state to either draw
     * lines or polygons. The method will first remove any prior draw
     * interaction created by this tool.
     * @returns {void}
     */
    createDrawInteraction ({state, dispatch, commit, rootGetters, rootState, getters}) {
        dispatch("removeDrawInteraction");

        let interaction = null;

        if (rootGetters["Map/is3d"]) {
            dispatch("deleteFeatures");
            interaction = makeDraw3d(
                rootGetters["Map/map3d"],
                rootGetters["Map/projectionCode"],
                unlistener => commit("addUnlistener", unlistener),
                rootState._store
            );
        }
        else {
            if (getters.unlisteners.length) {
                // if unlisteners are registered, this indicates 3D mode was active immediately before
                dispatch("deleteFeatures");
            }
            const map = rootGetters["Map/map"],
                {selectedGeometry} = state;

            interaction = makeDraw2d(
                map,
                selectedGeometry,
                feature => commit("addFeature", feature),
                overlay => commit("addOverlay", overlay),
                flag => commit("setIsDrawing", flag),
                rootState._store
            );
            map.addInteraction(interaction);
        }

        commit("setInteraction", interaction);
    },
    /**
     * Removes the draw interaction. This includes aborting any current
     * unfinished drawing, removing the interaction from the map, and
     * removing the interaction from the store.
     * @returns {void}
     */
    removeDrawInteraction ({state, commit, rootGetters}) {
        const {interaction, isDrawing, overlays} = state;

        if (interaction) {
            const map = rootGetters["Map/map"];

            if (isDrawing) {
                const overlaysCopy = [...overlays],
                    {overlay, vueInstance} = overlaysCopy.pop();

                vueInstance.$destroy();
                map.removeOverlay(overlay);

                commit("setOverlays", overlaysCopy);
            }
            interaction.abortDrawing();

            if (interaction.interaction3d) {
                // 3d interaction is not directly added to map, but provides it's own method
                interaction.stopInteraction();
            }
            else {
                map.removeInteraction(interaction);
            }

            commit("setInteraction", null);
        }
    }
};
