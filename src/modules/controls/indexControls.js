import getters from "./gettersControls";
import mutations from "./mutationsControls";
import backForward from "./backForward/store/indexBackForward";
import Attributions from "./attributions/components/Attributions.vue";
import BackForward from "./backForward/components/BackForward.vue";
import FullScreen from "./fullScreen/components/FullScreen.vue";
import OverviewMap from "./overviewMap/components/OverviewMap.vue";
import TotalView from "./totalView/components/TotalView.vue";
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
    // initial state - information on all controls that are not addons.
    state: {
        // maps config.json.md control key to component
        componentMap: {
            attributions: Attributions,
            backForward: BackForward,
            fullScreen: FullScreen,
            get "overviewmap" () {
                console.warn("'overviewmap' is deprecated. Please use 'overviewMap' instead.");
                return OverviewMap;
            },
            overviewMap: OverviewMap,
            get "totalview" () {
                console.warn("'totalview' is deprecated. Please use 'totalView' instead.");
                return TotalView;
            },
            totalView: TotalView,
            zoom: Zoom
        },
        // config.json.md control keys where the matching element is to be hidden in mobile mode
        mobileHiddenControls: [
            "backForward",
            "fullScreen",
            "mousePosition",
            "overviewMap",
            "totalView"
        ],
        bottomControls: ["attributions", "overviewmap", "overviewMap"]
    },
    mutations,
    getters
};
