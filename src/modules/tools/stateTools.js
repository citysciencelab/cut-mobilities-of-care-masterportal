import Draw from "./draw/components/Draw.vue";
import ScaleSwitcher from "./scaleSwitcher/components/ScaleSwitcher.vue";
import SupplyCoord from "./supplyCoord/components/SupplyCoord.vue";
import FileImport from "./fileImport/components/FileImport.vue";
import Gfi from "./gfi/components/Gfi.vue";
/**
 * User type definition
 * @typedef {Object} ToolsState
 * @property {Object} componentMap contains all tool components
 * @property {Object[]} configuredTools gets all tools that should be initialized
 */
const state = {
    componentMap: {
        draw: Draw,
        scaleSwitcher: ScaleSwitcher,
        supplyCoord: SupplyCoord,
        fileImport: FileImport,
        gfi: Gfi
    },
    configuredTools: []
};

export default state;
