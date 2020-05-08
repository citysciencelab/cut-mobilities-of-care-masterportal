import getters from "./gettersControls";
import mutations from "./mutationsControls";
import backForward from "./backForward/store/indexBackForward";
import Attributions from "./attributions/components/Attributions.vue";
import BackForward from "./backForward/components/BackForward.vue";
import OverviewMap from "./overviewMap/components/OverviewMap.vue";
import Zoom from "./zoom/components/Zoom.vue";

/**
 * controls-Module is required to be able to nest controls
 * in the store as ["controls", controlName].
 * Also holds information on control components and allows
 * addons to register themselves via mutation.
 */
export default {
    namespaced: true,
    modules: {
        backForward
    },
    state: {
        // initial state - information on all controls that are not addons.
        componentMap: {
            attributions: Attributions,
            backForward: BackForward,
            get "overviewmap" () {
                console.warn("'overviewmap' is deprecated. Please use 'overviewMap' instead.");
                return OverviewMap;
            },
            overviewMap: OverviewMap,
            zoom: Zoom
        },
        mobileHiddenControls: [
            "backForward",
            "mousePosition",
            "overviewMap"
        ],
        bottomControls: ["attributions", "overviewmap", "overviewMap"]
    },
    mutations,
    getters
};
