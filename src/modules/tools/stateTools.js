import ScaleSwitcher from "./scale/components/ScaleSwitcher.vue";
import SupplyCoord from "./supplyCoord/components/SupplyCoord.vue";
import KmlImport from "./kmlImport/components/KmlImport.vue";

const state = {
    componentMap: {
        scaleSwitcher: ScaleSwitcher,
        supplyCoord: SupplyCoord,
        /**
         * coord
         * @deprecated in 3.0.0
         */
        coord: SupplyCoord,
        kmlimport: KmlImport
    },
    configuredTools: []
};

export default state;
