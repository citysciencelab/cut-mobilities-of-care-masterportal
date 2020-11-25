import {getRecordById} from "../../src/api/csw/getRecordById.js";

Radio.channel("CswParser").on({
    "getMetaDataForLayerInformation": async function (cswObj) {
        cswObj.parsedData = {};

        if (cswObj.cswUrl === null || typeof cswObj.cswUrl === "undefined") {
            const cswId = Config.cswId || "3",
                cswService = Radio.request("RestReader", "getServiceById", cswId);

            cswObj.cswUrl = Radio.request("Util", "getProxyURL", cswService.get("url"));
        }

        const metadata = await getRecordById(Radio.request("Util", "getProxyURL", cswObj.cswUrl), cswObj.metaId);

        cswObj.parsedData.title = metadata.getTitle();
        cswObj.parsedData.abstractText = metadata.getAbstract();
        cswObj.parsedData.periodicity = metadata.getFrequenzy();
        cswObj.parsedData.dateRevision = metadata.getRevisionDate();
        cswObj.parsedData.downloadLinks = metadata.getDownloadLinks();
        if (typeof metadata.getPublicationDate() !== "undefined") {
            cswObj.parsedData.datePublication = metadata.getPublicationDate();
        }
        else if (typeof metadata.getCreationDate() !== "undefined") {
            cswObj.parsedData.datePublication = metadata.getCreationDate();
        }
        Radio.trigger("CswParser", "fetchedMetaDataForLayerInformation", cswObj, metadata);
    }
});
