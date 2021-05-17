import state from "./stateTools";
import getters from "./gettersTools";
import mutations from "./mutationsTools";
import actions from "./actionsTools";

/**
 * The imported tools.
 */
import AddWMS from "./addWMS/store/indexAddWMS";
import Contact from "./contact/store/indexContact";
import Draw from "./draw/store/indexDraw";
import FileImport from "./fileImport/store/indexFileImport";
import Gfi from "./gfi/store/indexGfi";
import Measure from "./measure/store/indexMeasure";
import SaveSelection from "./saveSelection/store/indexSaveSelection";
import SearchByCoord from "./searchByCoord/store/indexSearchByCoord";
import ScaleSwitcher from "./scaleSwitcher/store/indexScaleSwitcher";
import StyleVT from "./styleVT/store/indexStyleVT";
import SupplyCoord from "./supplyCoord/store/indexSupplyCoord";
import SelectFeatures from "./selectFeatures/store/indexSelectFeatures";
import BufferAnalysis from "./bufferAnalysis/store/indexBufferAnalysis";

/**
 * This is here to test app-store/utils/composeModules.
 * Also provides actions.
 */
export default {
    namespaced: true,
    modules: {
        AddWMS,
        Contact,
        Draw,
        FileImport,
        Gfi,
        Measure,
        SaveSelection,
        SearchByCoord,
        ScaleSwitcher,
        StyleVT,
        SupplyCoord,
        SelectFeatures,
        BufferAnalysis
    },
    state,
    getters,
    mutations,
    actions
};
