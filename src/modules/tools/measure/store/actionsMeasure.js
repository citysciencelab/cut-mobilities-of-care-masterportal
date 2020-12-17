import source from "../measureSource";
import {makeDraw} from "../measureDraw";

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
    createDrawInteraction ({state, dispatch, commit, rootGetters}) {
        dispatch("removeDrawInteraction");

        const map = rootGetters["Map/map"],
            {selectedGeometry} = state,
            interaction = makeDraw(
                map,
                selectedGeometry,
                feature => commit("addFeature", feature),
                overlay => commit("addOverlay", overlay)
            );

        map.addInteraction(interaction);
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
            map.removeInteraction(interaction);
            commit("setInteraction", null);
        }
    }
};
