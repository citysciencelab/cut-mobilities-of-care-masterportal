import WMSGetFeatureInfo from "ol/format/WMSGetFeatureInfo.js";
import Feature from "ol/Feature";
import axios from "axios";

/**
 * handles the GetFeatureInfo request
 * @param {String} mimeType - text/xml | text/html
 * @param {String} url - the GetFeatureInfo request url
 * @returns {Promise<module:ol/Feature[]>}  Promise object represents the GetFeatureInfo request
 */
export function requestGfi (mimeType, url) {
    return axios.get(url)
        .then(response => handleResponseAxios(response))
        .then(docString => {
            const parsedDocument = parseDocumentString(docString, mimeType);

            if (mimeType === "text/html") {
                if (parsedDocument.getElementsByTagName("tbody")[0]?.children.length >= 1) {
                    return docString;
                }
                return null;
            }

            return parsedDocument;
        })
        .then(doc => {
            if (mimeType === "text/xml") {
                return parseFeatures(doc);
            }
            return doc;
        })
        .catch(error => {
            throw error;
        });
}

/**
 * returns the data from the axios response
 * @throws will throw an error if the response is not valid
 * @param {Object} response the response gotten by axios
 * @returns {Object} the received data or undefined if an error occured
 */
export function handleResponseAxios (response) {
    if (
        response === null
        || typeof response !== "object"
        || !response.hasOwnProperty("status")
        || !response.hasOwnProperty("statusText")
        || !response.hasOwnProperty("data")
    ) {
        console.warn("requestGfi, handleResponseAxios: response", response);
        throw Error("requestGfi, handleResponseAxios: the received response is not valid");
    }
    else if (response.status !== 200) {
        console.warn("requestGfi, handleResponseAxios: response", response);
        throw Error("requestGfi, handleResponseAxios: the received status code indicates an error");
    }

    return response.data;
}

/**
 * parses the given string as DOM document
 * @throws will throw an error - parsing errors are reported on the console by DOMParser
 * @param {String} documentString the string to parse
 * @param {String} mimeType the mimeType to use (text/xml, text/html) - other formats are currently not supported and may not work
 * @param {Function} [parseFromStringOpt=null] a function(documentString, mimeType) for parsing the document (for testing only)
 * @returns {(Document|XMLDocument)}  a valid document, free of parser errors
 */
export function parseDocumentString (documentString, mimeType, parseFromStringOpt = null) {
    const domParser = new DOMParser(),
        doc = typeof parseFromStringOpt === "function" ? parseFromStringOpt(documentString, mimeType) : domParser.parseFromString(documentString, mimeType);
    let errObj = null,
        parsererror = null;

    if (doc === null || typeof doc !== "object" || !(doc instanceof Document) && doc.constructor.name !== "XMLDocument") {
        // parsing errors are reported on the console by DOMParser
        throw Error("requestGfi, checkParsingProcess: the received doc is no valid Document nor XMLDocument");
    }

    parsererror = doc.getElementsByTagName("parsererror");

    if (parsererror instanceof HTMLCollection && parsererror.length > 0) {
        for (errObj of parsererror) {
            console.warn("requestGfi, parseDocumentString: parsererror", errObj);
            throw Error("requestGfi, parseDocumentString: the parsererror has reported a problem");
        }
    }

    return doc;
}

/**
 * Parses the response into openlayers features.
 * A distinction is made between ESRI services and OGC-conform services.
 * OpenLayers supports OGC-conform services that have the root element `FeatureCollection` or `msGMLOutput`.
 * @throws Will throw an error.
 * @param {XMLDocument} doc Data to be parsed.
 * @returns {module:ol/Feature[]} Collection of openlayers features.
 */
export function parseFeatures (doc) {
    const firstChild = doc.firstChild.tagName;
    let features = [];

    if (firstChild.includes("FeatureCollection") || firstChild.includes("msGMLOutput")) {
        features = parseOgcConformFeatures(doc);
    }
    else {
        features = parseEsriFeatures(doc);
    }

    return features;
}

/**
 * Parse the response of a gfi from an OGC-conform service.
 * @param {XMLDocument} doc Data to be parsed.
 * @returns {module:ol/Feature[]} Collection of openlayers features.
 */
function parseOgcConformFeatures (doc) {
    const gfiFormat = new WMSGetFeatureInfo();

    return gfiFormat.readFeatures(doc);
}

/**
 * Parse the response of a gfi from an ESRi service.
 * @param {XMLDocument} doc Data to be parsed.
 * @returns {module:ol/Feature[]} Collection of openlayers features.
 */
function parseEsriFeatures (doc) {
    const features = [];

    doc.getElementsByTagName("FIELDS").forEach(element => {
        const feature = new Feature();

        element.attributes.forEach(attribute => {
            feature.set(attribute.localName, attribute.value);
        });
        features.push(feature);
    });

    return features;
}

export default {requestGfi, handleResponseAxios, parseDocumentString, parseFeatures};
