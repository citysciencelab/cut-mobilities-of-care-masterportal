import source from "../measureSource";
import makeDraw2d from "../measureDraw";
import makeDraw3d from "../measureDraw3d";

export default {
    /**
     * Deletes all geometries from the measure layer,
     * and removes belonging UI/state.
     * @return {void}
     */
    deleteFeatures ({state, commit, rootGetters}) {
        const {overlays, interaction} = state,
            map = rootGetters["Map/map"];

        interaction.abortDrawing();
        overlays.forEach(({vueInstance, overlay}) => {
            map.removeOverlay(overlay);
            vueInstance.$destroy();
        });
        source.clear();

        commit("setLines", {});
        commit("setPolygons", {});
        commit("setOverlays", []);
    },
    /**
     * Creates a new draw interaction depending on state to either draw
     * lines or polygons. The method will first remove any prior draw
     * interaction created by this tool.
     * @returns {void}
     */
    createDrawInteraction ({state, dispatch, commit, rootGetters, getters}) {
        dispatch("removeDrawInteraction");

        const {selectedGeometry} = state;
        let interaction = null;

        if (getters.is3d) {
            interaction = makeDraw3d(
                rootGetters["Map/map3d"],
                rootGetters["Map/projectionCode"],
                getters.selectedUnit
            );
        }
        else {
            const map = rootGetters["Map/map"];

            interaction = makeDraw2d(
                map,
                selectedGeometry,
                feature => commit("addFeature", feature),
                overlay => commit("addOverlay", overlay)
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
        const {interaction} = state;

        if (interaction) {
            const map = rootGetters["Map/map"];

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
