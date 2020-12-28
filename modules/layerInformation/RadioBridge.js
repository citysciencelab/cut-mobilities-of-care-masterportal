import {getRecordById} from "../../src/api/csw/getRecordById.js";
import getProxyUrl from "../../src/utils/getProxyUrl";
import store from "../../src/app-store/index";

Radio.channel("CswParser").on({
    "getMetaDataForLayerInformation": async function (cswObj) {
        let metadata;

        cswObj.parsedData = {};

        if (cswObj?.cswUrl === null || typeof cswObj?.cswUrl === "undefined") {
            const cswId = Config.cswId || "3",
                cswService = Radio.request("RestReader", "getServiceById", cswId);

            cswObj.cswUrl = cswService.get("url");
        }

        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        if (store?.getters?.metadata?.useProxy?.includes(cswObj?.cswUrl)) {
            metadata = await getRecordById(getProxyUrl(cswObj.cswUrl), cswObj.metaId);
        }
        else {
            metadata = await getRecordById(cswObj.cswUrl, cswObj.metaId);
        }

        if (typeof metadata === "undefined") {
            store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.layerInformation.errorMessage", {cswObjCswUrl: cswObj.cswUrl}));
            cswObj.parsedData.title = "";
            cswObj.parsedData.abstractText = i18next.t("common:modules.layerInformation.noMetadataLoaded");
        }
        else {
            cswObj.parsedData.title = metadata?.getTitle();
            cswObj.parsedData.abstractText = metadata?.getAbstract();
            cswObj.parsedData.periodicityKey = metadata?.getFrequenzy();
            cswObj.parsedData.dateRevision = metadata?.getRevisionDate();
            cswObj.parsedData.downloadLinks = metadata?.getDownloadLinks();
            cswObj.parsedData.datePublication = metadata?.getPublicationDate() || metadata?.getCreationDate();
        }

        Radio.trigger("CswParser", "fetchedMetaDataForLayerInformation", cswObj);
    }
});
