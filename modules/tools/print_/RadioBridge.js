/**
 * The Radio Channel GFI is no longer available in the "new" Gfi (src/modules/tools/gfi).
 * This file is used for communication between this module and the new Gfi.
 * It can be deleted, if this module has been refactored.
 */

import store from "../../../src/app-store";
import {getRecordById} from "../../../src/api/csw/getRecordById.js";

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

Radio.channel("CswParser").on({
    "getMetaDataForPrint": async function (cswObj) {
        cswObj.parsedData = {};

        if (cswObj.cswUrl === null || typeof cswObj.cswUrl === "undefined") {
            const cswId = Config.cswId || "3",
                cswService = Radio.request("RestReader", "getServiceById", cswId);

            cswObj.cswUrl = Radio.request("Util", "getProxyURL", cswService.get("url"));
        }
        const metadata = await getRecordById(Radio.request("Util", "getProxyURL", cswObj.cswUrl), cswObj.metaId);

        cswObj.parsedData = {};
        cswObj.parsedData.orgaOwner = metadata.getOwner().name || "n.N.";
        cswObj.parsedData.address = {
            street: metadata.getOwner().street || "",
            housenr: "",
            postalCode: metadata.getOwner().postalCode || "",
            city: metadata.getOwner().city || ""
        };
        cswObj.parsedData.email = metadata.getOwner().email || "n.N.";
        cswObj.parsedData.tel = metadata.getOwner().phone || "n.N.";
        cswObj.parsedData.url = metadata.getOwner().link || "n.N.";

        if (typeof metadata.getRevisionDate() !== "undefined") {
            cswObj.parsedData.date = metadata.getRevisionDate();
        }
        else if (typeof metadata.getPublicationDate() !== "undefined") {
            cswObj.parsedData.date = metadata.getPublicationDate();
        }
        else if (typeof metadata.getCreationDate() !== "undefined") {
            cswObj.parsedData.date = metadata.getCreationDate();
        }
        Radio.trigger("CswParser", "fetchedMetaDataForPrint", cswObj, metadata);
    }
});
