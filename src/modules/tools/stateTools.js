import ScaleSwitcher from "./scale/components/ScaleSwitcher.vue";
import SupplyCoord from "./supplyCoord/components/SupplyCoord.vue";
import FileImport from "./fileImport/components/FileImport.vue";

/**
 * User type definition
 * @typedef {object} ToolsState
 * @property {object} componentMap contains all tool components
 * @property {object[]} configuredTools gets all tools that should be initialized
 */
const state = {
    componentMap: {
        scaleSwitcher: ScaleSwitcher,
        supplyCoord: SupplyCoord,
        /**
         * coord
         * @deprecated in 3.0.0
         */
        coord: SupplyCoord,
        fileimport: FileImport
    },
    configuredTools: []
};

export default state;
