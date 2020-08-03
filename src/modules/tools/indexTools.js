
import state from "./stateTools";
import getters from "./gettersTools";
import actions from "./actionsTools";
import ScaleSwitcher from "./scale/store/indexScaleSwitcher";
import SupplyCoord from "./supplyCoord/store/indexSupplyCoord";
import KmlImport from "./kmlImport/store/indexKmlImport";

/**
 * This is here to test app-store/utils/composeModules.
 * Also provides actions.
 */
export default {
    namespaced: true,
    modules: {
        ScaleSwitcher,
        SupplyCoord,
        KmlImport
    },
    state,
    getters,
    actions
};
