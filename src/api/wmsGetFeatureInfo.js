import WMSGetFeatureInfo from "ol/format/WMSGetFeatureInfo.js";
import Feature from "ol/Feature";

// Testlayer für ESRI -> Geologische_Karte_5000
// Testlayer für html -> Bohrdaten GLA & Eventlots

/**
 * handles the GetFeatureInfo request
 * @param {string} mimeType - text/xml | text/html
 * @param {string} url - the GetFeatureInfo request url
 * @returns {Promise} Promise object represents the GetFeatureInfo request
 */
function requestGfi (mimeType, url) {
    const domParser = new DOMParser();

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.text();
        })
        .then(responseText => domParser.parseFromString(responseText, mimeType))
        .then(doc => {
            // if the parsing process fails, the DOMParser does not throw an exception, but instead returns an error document
            if (doc.getElementsByTagName("parsererror").length > 0) {
                throw Error("Parsing Document: " + doc.getElementsByTagName("parsererror")[0].textContent);
            }
            return doc;
        })
        .then(doc => {
            if (mimeType === "text/xml") {
                return parseFeatures(doc);
            }
            // mimeType === "text/html" -> other formats are currently not supported
            return [doc];
        })
        .catch(error => {
            console.warn(error);
        });
}

/**
 * Parses the response into openlayers features
 * @param {XMLDocument} data - data to be parsed
 * @returns {module:ol/Feature[]} array of openlayers features
 */
function parseFeatures (data) {
    // OGC-conform
    if (data.firstChild.tagName === "FeatureCollection") {
        const gfiFormat = new WMSGetFeatureInfo();

        return gfiFormat.readFeatures(data).flat();
    }
    // ESRI...
    const features = [];

    data.getElementsByTagName("FIELDS").forEach(element => {
        const feature = new Feature();

        element.attributes.forEach(attribute => {
            feature.set(attribute.localName, attribute.value);
        });
        features.push(feature);
    });
    return features;
}

export default requestGfi;
