
import state from "./stateTools";
import getters from "./gettersTools";
import mutations from "./mutationsTools";
import actions from "./actionsTools";

/**
 * The imported tools.
 */
import Draw from "./draw/store/indexDraw";
import FileImport from "./fileImport/store/indexFileImport";
import Gfi from "./gfi/store/indexGfi";
import ScaleSwitcher from "./scaleSwitcher/store/indexScaleSwitcher";
import SupplyCoord from "./supplyCoord/store/indexSupplyCoord";

/**
 * This is here to test app-store/utils/composeModules.
 * Also provides actions.
 */
export default {
    namespaced: true,
    modules: {
        Draw,
        FileImport,
        Gfi,
        ScaleSwitcher,
        SupplyCoord
    },
    state,
    getters,
    mutations,
    actions
};
