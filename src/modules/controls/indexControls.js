import getters from "./gettersControls";
import mutations from "./mutationsControls";
import attributions from "./attributions/store/indexAttributions";
import backForward from "./backForward/store/indexBackForward";
import Attributions from "./attributions/components/Attributions.vue";
import BackForward from "./backForward/components/BackForward.vue";
<<<<<<< HEAD
import FullScreen from "./fullScreen/components/FullScreen.vue";
=======
import OverviewMap from "./overviewMap/components/OverviewMap.vue";
>>>>>>> df627ad1990d536d69f8dc209676ac2cbf8c7c67
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
        attributions,
        backForward
    },
    state: {
        // initial state - information on all controls that are not addons.
        componentMap: {
            attributions: Attributions,
            backForward: BackForward,
            fullScreen: FullScreen,
            get "overviewmap" () {
                console.warn("'overviewmap' is deprecated. Please use 'overviewMap' instead.");
                return OverviewMap;
            },
            overviewMap: OverviewMap,
            zoom: Zoom
        },
        mobileHiddenControls: [
            "backForward",
            "fullScreen",
            // NOTE "mousePosition" is not rendered as a child here
            "overviewMap"
        ],
        bottomControls: ["attributions", "overviewmap", "overviewMap"]
    },
    mutations,
    getters
};
