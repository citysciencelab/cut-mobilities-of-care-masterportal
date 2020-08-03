import ScaleSwitcher from "./scale/components/ScaleSwitcher.vue";
import SupplyCoord from "./supplyCoord/components/SupplyCoord.vue";
import KmlImport from "./kmlImport/components/KmlImport.vue";

const state = {
    componentMap: {
        scaleSwitcher: ScaleSwitcher,
        supplyCoord: SupplyCoord,
        kmlimport: KmlImport
    }
};

export default state;
