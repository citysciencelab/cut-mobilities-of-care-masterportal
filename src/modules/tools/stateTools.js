import AddWMS from "./addWMS/components/AddWMS.vue";
import Contact from "./contact/components/Contact.vue";
import Draw from "./draw/components/Draw.vue";
import FileImport from "./fileImport/components/FileImport.vue";
import Gfi from "./gfi/components/Gfi.vue";
import SearchByCoord from "./searchByCoord/components/SearchByCoord.vue";
import Measure from "./measure/components/Measure.vue";
import SaveSelection from "./saveSelection/components/SaveSelection.vue";
import ScaleSwitcher from "./scaleSwitcher/components/ScaleSwitcher.vue";
import StyleVT from "./styleVT/components/StyleVT.vue";
import SupplyCoord from "./supplyCoord/components/SupplyCoord.vue";
import SelectFeatures from "./selectFeatures/components/SelectFeatures.vue";
import BufferAnalysis from "./bufferAnalysis/components/BufferAnalysis.vue";

/**
 * User type definition
 * @typedef {Object} ToolsState
 * @property {Object} componentMap contains all tool components
 * @property {Object[]} configuredTools gets all tools that should be initialized
 */
const state = {
    componentMap: {
        addWMS: AddWMS,
        contact: Contact,
        draw: Draw,
        fileImport: FileImport,
        gfi: Gfi,
        searchByCoord: SearchByCoord,
        measure: Measure,
        saveSelection: SaveSelection,
        scaleSwitcher: ScaleSwitcher,
        styleVT: StyleVT,
        supplyCoord: SupplyCoord,
        selectFeatures: SelectFeatures,
        bufferAnalysis: BufferAnalysis
    },
    configuredTools: []
};

export default state;
