import Draw from "./draw/components/Draw.vue";
import FileImport from "./fileImport/components/FileImport.vue";
import Gfi from "./gfi/components/Gfi.vue";
import Measure from "./measure/components/Measure.vue";
import SaveSelection from "./saveSelection/components/SaveSelection.vue";
import ScaleSwitcher from "./scaleSwitcher/components/ScaleSwitcher.vue";
import SupplyCoord from "./supplyCoord/components/SupplyCoord.vue";
import BufferAnalysis from "./bufferAnalysis/components/BufferAnalysis.vue";

/**
 * User type definition
 * @typedef {Object} ToolsState
 * @property {Object} componentMap contains all tool components
 * @property {Object[]} configuredTools gets all tools that should be initialized
 */
const state = {
    componentMap: {
        draw: Draw,
        fileImport: FileImport,
        gfi: Gfi,
        measure: Measure,
        saveSelection: SaveSelection,
        scaleSwitcher: ScaleSwitcher,
        supplyCoord: SupplyCoord,
        bufferAnalysis: BufferAnalysis
    },
    configuredTools: []
};

export default state;
