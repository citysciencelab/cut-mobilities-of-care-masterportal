import getters from "./gettersControls";
import mutations from "./mutationsControls";
import attributions from "./attributions/store/indexAttributions";
import backForward from "./backForward/store/indexBackForward";
import orientation from "./orientation/store/indexOrientation";
import Attributions from "./attributions/components/Attributions.vue";
import BackForward from "./backForward/components/BackForward.vue";
import FullScreen from "./fullScreen/components/FullScreen.vue";
import Orientation from "./orientation/components/Orientation.vue";
import OverviewMap from "./overviewMap/components/OverviewMap.vue";
import TotalView from "./totalView/components/TotalView.vue";
import Zoom from "./zoom/components/Zoom.vue";
import Freeze from "./freeze/components/Freeze.vue";

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
        backForward,
        orientation
    },
    // initial state - information on all controls that are not addons.
    state: {
        // maps config.json.md control key to component
        componentMap: {
            attributions: Attributions,
            backForward: BackForward,
            fullScreen: FullScreen,
            orientation: Orientation,
            overviewMap: OverviewMap,
            totalView: TotalView,
            zoom: Zoom,
            freeze: Freeze
        },
        // config.json.md control keys where the matching element is to be hidden in mobile mode
        mobileHiddenControls: [
            "backForward",
            "fullScreen",
            // NOTE "mousePosition" is not rendered as a child here
            "overviewMap",
            "totalView",
            "freeze"
        ],
        bottomControls: ["attributions", "overviewMap"]
    },
    mutations,
    getters
};
