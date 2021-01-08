import {Circle} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";
import {GeoJSON, GPX} from "ol/format.js";

import {transform, transformPoint} from "../../utils/download/transformGeometry";

/**
 * Converts the features from OpenLayers Features to features in the chosen format.
 *
 * @param {Object} context actions context object.
 * @param {module:ol/format} format Format in which the features should be saved.
 * @returns {string} The features written in the chosen format as a String.
 */
async function convertFeatures ({state, dispatch}, format) {
    const convertedFeatures = [];

    for (const feature of state.download.features) {
        const cloned = feature.clone(),
            transCoords = await dispatch("transformCoordinates", cloned.getGeometry());

        if (transCoords.length === 3 && transCoords[2] === 0) {
            transCoords.pop();
        }

        cloned.getGeometry().setCoordinates(transCoords, "XY");
        convertedFeatures.push(cloned);
    }

    return format.writeFeatures(convertedFeatures);
}

/**
 * Converts the features to the chosen format and saves it in the state.
 *
 * @param {Object} context actions context object.
 * @returns {undefined}
 */
async function prepareData ({state, commit, dispatch}) {
    let features = "";

    switch (state.download.selectedFormat) {
        case "GEOJSON":
            features = await dispatch("convertFeatures", new GeoJSON());
            break;
        case "GPX":
            features = await dispatch("convertFeatures", new GPX());
            break;
        case "KML":
            features = await dispatch("convertFeaturesToKml");
            break;
        case "none":
            commit("setDownloadSelectedFormat", "");
            break;
        default:
            break;
    }

    commit("setDownloadDataString", features);
}

/**
 * Prepares the download.
 * If the user is using Internet Explorer as a Browser a Blob is used, otherwise the download is accomplished through the href & download combo on an anchor tag.
 *
 * @param {Object} context actions context object.
 * @returns {undefined}
 */
function prepareDownload ({state, commit, dispatch}) {
    dispatch("validateFileName").then(fileName => {
        if (fileName && fileName !== "") {
            const dataString = state.download.dataString,
                isIE = Radio.request("Util", "isInternetExplorer");

            commit("setDownloadFile", fileName);

            if (isIE) {
                window.navigator.msSaveOrOpenBlob(new Blob([dataString]), fileName);
            }
            else {
                const url = `data:text/plain;charset=utf-8,${encodeURIComponent(dataString)}`;

                commit("setDownloadFileUrl", url);
            }
        }
    }).catch(err => {
        console.error(err);
    });
}

/**
 * Commits the current features of the draw layer to the state.
 * Action is dispatched when a feature is drawn, edited or deleted.
 * NOTE: When a feature is an instance of ol/Circle, it is converted to a ol/Polygon first.
 *
 * @param {Object} context actions context object.
 * @returns {undefined}
 */
function setDownloadFeatures ({state, commit, dispatch}) {
    const features = state.layer.getSource().getFeatures();

    features.forEach(feature => {
        const geometry = feature.getGeometry();

        // TODO(roehlipa): Is this still needed for compatibility reasons for the choosable formats or can this be removed?
        if (geometry instanceof Circle) {
            feature.setGeometry(fromCircle(geometry));
        }
    });

    commit("setDownloadFeatures", features);
    dispatch("prepareData");
    dispatch("prepareDownload");
}

/**
 * Commits the input of the user for the name of the file to the state.
 * If at least one feature is already drawn, the download is prepared.
 * If the user entered a name for a file and has chosen a format for the features, the download button is enabled.
 *
 * @param {Object} context actions context object.
 * @param {Event} event Event fired by changing the input for the name of the file.
 * @param {HTMLInputElement} event.currentTarget The HTML input element for the name of the file.
 * @returns {undefined}
 */
function setDownloadFileName ({state, commit, dispatch}, {currentTarget}) {
    const features = state.layer.getSource().getFeatures(),
        length = features.length,
        {value} = currentTarget;

    commit("setDownloadFileName", value);

    if (length > 0) {
        dispatch("prepareDownload");
    }
}

/**
 * Commits the selection of the user for file format to the state.
 * If at least one feature is already drawn, they are converted to the chosen format and the download is prepared.
 * If the user entered a name for a file and has chosen a format for the features, the download button is enabled.
 *
 * @param {Object} context actions context object.
 * @param {Event} event Event fired by selecting a different element.
 * @param {HTMLSelectElement} event.currentTarget The HTML select element for the file format.
 * @returns {undefined}
 */
async function setDownloadSelectedFormat ({state, commit, dispatch}, {currentTarget}) {
    const features = state.layer.getSource().getFeatures(),
        length = features.length,
        {value} = currentTarget;

    commit("setDownloadSelectedFormat", value);
    if (length > 0) {
        await dispatch("prepareData");
        dispatch("prepareDownload");
    }
}

/**
 * Transforms the given geometry from EPSG:25832 to EPSG:4326.
 * If the geometry is not an instance of ol/LineString, ol/Point or ol/Polygon an Alert is send to the user.
 *
 * @param {Object} context actions context object.
 * @param {module:ol/geom/Geometry} geometry Geometry to be transformed.
 * @returns {(Array<number>|Array<Array<number>>|Array<Array<Array<number>>>)|[]} The transformed Geometry or an empty array.
 */
function transformCoordinates ({dispatch}, geometry) {
    const coords = geometry.getCoordinates();

    switch (geometry.getType()) {
        case "LineString":
            return transform(coords, false);
        case "Point":
            return transformPoint(coords);
        case "Polygon":
            return transform(coords, true);
        default:
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.download.unknownGeometry", {geometry: geometry.getType()}), {root: true});
            return [];
    }
}

/**
 * Checks whether the user has added the suffix of the chosen format to the filename and if not, it is added.
 *
 * @param {Object} context actions context object.
 * @returns {String} Returns the filename including the suffix of the chosen format; returns and empty String if either the filename or the format has not been chosen yet.
 */
function validateFileName ({state}) {
    const {download} = state,
        {fileName, selectedFormat} = download;

    if (fileName.length > 0 && selectedFormat.length > 0) {
        const suffix = `.${selectedFormat.toLowerCase()}`;

        return fileName.toLowerCase().endsWith(suffix) ? fileName : fileName + suffix;
    }
    return "";
}

export {
    convertFeatures,
    prepareData,
    prepareDownload,
    setDownloadFeatures,
    setDownloadFileName,
    setDownloadSelectedFormat,
    transformCoordinates,
    validateFileName
};
