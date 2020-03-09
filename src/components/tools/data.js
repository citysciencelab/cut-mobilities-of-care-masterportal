import Measure from "./Measure/Measure.vue";
import SupplyCoord from "./SupplyCoord/SupplyCoord.vue";

/*
 * NOTE
 * Could be moved to ./module.js to have the same
 * effects as in prototype in ../controls/module.js.
 */

const componentMap = {
    measure: Measure,
    coord: SupplyCoord
};

export {
    componentMap
};
