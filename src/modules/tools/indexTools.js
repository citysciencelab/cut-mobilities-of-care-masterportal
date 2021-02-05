import state from "./stateTools";
import getters from "./gettersTools";
import mutations from "./mutationsTools";
import actions from "./actionsTools";

/**
 * The imported tools.
 */
import Contact from "./contact/store/indexContact";
import Draw from "./draw/store/indexDraw";
import FileImport from "./fileImport/store/indexFileImport";
import Gfi from "./gfi/store/indexGfi";
import SaveSelection from "./saveSelection/store/indexSaveSelection";
import ScaleSwitcher from "./scaleSwitcher/store/indexScaleSwitcher";
import SupplyCoord from "./supplyCoord/store/indexSupplyCoord";
import Measure from "./measure/store/indexMeasure";

/**
 * This is here to test app-store/utils/composeModules.
 * Also provides actions.
 */
export default {
    namespaced: true,
    modules: {
        Contact,
        Draw,
        FileImport,
        Gfi,
        SaveSelection,
        ScaleSwitcher,
        SupplyCoord,
        Measure
    },
    state,
    getters,
    mutations,
    actions
};
