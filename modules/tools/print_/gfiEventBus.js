/**
 * The Radio Channel GFI is no longer available in the "new" Gfi (src/modules/tools/gfi).
 * This file is used for communication between this module and the new Gfi.
 * It can be deleted, if this module has been refactored.
 */

import store from "../../../src/app-store";

store.watch((state, getters) => getters["Tools/Gfi/currentFeature"], feature => {
    if (feature !== null) {
        Radio.trigger("GFI", "isVisible", true);
    }
    else {
        Radio.trigger("GFI", "isVisible", false);
    }
});

Radio.channel("GFI").reply({
    "getGfiForPrint": function () {
        const feature = store.getters["Tools/Gfi/currentFeature"],
            coordinate = store.getters["Map/clickCoord"];

        if (feature !== null) {
            return [feature.getMappedProperties(), feature.getTitle(), coordinate];
        }
        return [];
    },
    "getIsVisible": function () {
        const feature = store.getters["Tools/Gfi/currentFeature"];

        if (feature !== null) {
            return true;
        }
        return false;
    }
});
