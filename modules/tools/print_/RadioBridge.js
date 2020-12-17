/**
 * The Radio Channel GFI is no longer available in the "new" Gfi (src/modules/tools/gfi).
 * This file is used for communication between this module and the new Gfi.
 * It can be deleted, if this module has been refactored.
 */

import store from "../../../src/app-store";
import {getRecordById} from "../../../src/api/csw/getRecordById.js";
import getProxyUrl from "../../../src/utils/getProxyUrl";

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
    "getMetaDataForPrint": async function (cswObj, layer) {
        let metadata;

        if (layer.get("datasets") && Array.isArray(layer.get("datasets")) && layer.get("datasets")[0] !== null && typeof layer.get("datasets")[0] === "object") {
            cswObj.cswUrl = layer.get("datasets")[0].hasOwnProperty("csw_url") ? layer.get("datasets")[0].csw_url : null;
        }

        cswObj.parsedData = {};

        if (cswObj.cswUrl === null || typeof cswObj.cswUrl === "undefined") {
            const cswId = Config.cswId || "3",
                cswService = Radio.request("RestReader", "getServiceById", cswId);

            cswObj.cswUrl = cswService.get("url");
        }

        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        if (store?.getters?.metadata?.useProxy?.includes(cswObj.cswUrl)) {
            metadata = await getRecordById(getProxyUrl(cswObj.cswUrl), cswObj.metaId);
        }
        else {
            metadata = await getRecordById(cswObj.cswUrl, cswObj.metaId);
        }

        if (typeof metadata === "undefined") {
            store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.layerInformation.errorMessage", {cswObjCswUrl: cswObj.cswUrl}));
        }
        else {
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
        }

        Radio.trigger("CswParser", "fetchedMetaDataForPrint", cswObj);
    }
});
