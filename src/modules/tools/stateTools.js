import Draw from "./draw/components/Draw.vue";
import Download from "./download/components/Download.vue";
import FileImport from "./fileImport/components/FileImport.vue";
import Gfi from "./gfi/components/Gfi.vue";
import ScaleSwitcher from "./scaleSwitcher/components/ScaleSwitcher.vue";
import SupplyCoord from "./supplyCoord/components/SupplyCoord.vue";

/**
 * User type definition
 * @typedef {Object} ToolsState
 * @property {Object} componentMap contains all tool components
 * @property {Object[]} configuredTools gets all tools that should be initialized
 */
const state = {
    componentMap: {
        draw: Draw,
        download: Download,
        fileImport: FileImport,
        gfi: Gfi,
        scaleSwitcher: ScaleSwitcher,
        supplyCoord: SupplyCoord
    },
    configuredTools: []
};

export default state;
