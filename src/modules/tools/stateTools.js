import Draw from "./draw/components/Draw.vue";
import ScaleSwitcher from "./scaleSwitcher/components/ScaleSwitcher.vue";
import SupplyCoord from "./supplyCoord/components/SupplyCoord.vue";
import FileImport from "./fileImport/components/FileImport.vue";
import Gfi from "./gfi/components/Gfi.vue";
/**
 * User type definition
 * @typedef {object} ToolsState
 * @property {object} componentMap contains all tool components
 * @property {object[]} configuredTools gets all tools that should be initialized
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
