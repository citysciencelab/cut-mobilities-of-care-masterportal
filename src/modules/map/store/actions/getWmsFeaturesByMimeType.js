import {requestGfi} from "../../../../api/wmsGetFeatureInfo";

/**
 * returns a list of wms features for the given url and mimeType
 * @param {String} mimeType the infoFormat of the wms (either text/xml or text/html)
 * @param {String} url the url to call the wms features from
 * @param {String} layerName the name of the requesting layer
 * @param {String} gfiTheme the title of the theme - it does not check if the theme exists
 * @param {String} gfiIconPath path to icon used as fallback
 * @param {(Object|String)} attributesToShow an object of attributes to show or a string "showAll" or "ignore"
 * @param {Object} gfiAsNewWindow null or an object of how to open the gfi in a new window
 * @param {String} [gfiAsNewWindow.name="_blank"] the browsing context or the target attribute to open the window (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
 * @param {String} [gfiAsNewWindow.specs=""] a comma-separated list of items - the setup to open the window with (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
 * @param {Function} [requestGfiOpt=null] a function (mimeType, url) to call the wms url with (for testing only)
 * @param {Function} [openWindowOpt=null] a function (url, name, specs) to open a new browser window with if gfiAsNewWindow is given (for testing only)
 * @returns {Object[]}  a list of object{getTheme, getIconPath, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
export function getWmsFeaturesByMimeType (mimeType, url, layerName, gfiTheme, gfiIconPath, attributesToShow, gfiAsNewWindow, requestGfiOpt = null, openWindowOpt = null) {
    if (openFeaturesInNewWindow(url, gfiAsNewWindow, typeof openWindowOpt === "function" ? openWindowOpt : window.open) === true) {
        return [];
    }

    if (mimeType === "text/xml") {
        return getXmlFeatures(url, layerName, gfiTheme, gfiIconPath, attributesToShow, typeof requestGfiOpt === "function" ? requestGfiOpt : requestGfi);
    }

    // mimeType === "text/html"
    return getHtmlFeature(url, layerName, gfiTheme, gfiIconPath, attributesToShow, typeof requestGfiOpt === "function" ? requestGfiOpt : requestGfi);
}

/**
 * opens a new window with the given url if gfiAsNewWindow is set
 * will open any http that is no SSL in a new window
 * @param {String} url the url to call the wms features from
 * @param {Object} gfiAsNewWindow null or an object of how to open the gfi in a new window
 * @param {String} [gfiAsNewWindow.name="_blank"] the browsing context or the target attribute to open the window (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
 * @param {String} [gfiAsNewWindow.specs=""] a comma-separated list of items - the setup to open the window with (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
 * @param {Function} openWindow a function (url, name, specs) to open a new browser window with
 * @returns {Boolean}  true if a window is opened, false if no window was opened
 */
export function openFeaturesInNewWindow (url, gfiAsNewWindow, openWindow) {
    if (typeof url !== "string") {
        return false;
    }
    else if (typeof openWindow !== "function") {
        return false;
    }

    let newWindowProps = gfiAsNewWindow;

    if ((newWindowProps === null || typeof newWindowProps !== "object") && url.startsWith("http:", 0)) {
        // make sure not to open http (no mixed content)
        newWindowProps = {
            name: "",
            specs: ""
        };
    }

    if (newWindowProps !== null && typeof newWindowProps === "object") {
        // do not add to gfiFeatures, open a new window with given specs instead
        const name = newWindowProps.hasOwnProperty("name") ? newWindowProps.name : "",
            specs = newWindowProps.hasOwnProperty("specs") ? newWindowProps.specs : "";

        openWindow(url, name, specs);
        return true;
    }

    return false;
}

/**
 * returns a list of objects representing the features called by url
 * @param {String} url the url to call the wms features from
 * @param {String} layerName the name of the requesting layer
 * @param {String} gfiTheme the title of the theme - it does not check if the theme exists
 * @param {String} gfiIconPath path to icon used as fallback
 * @param {(Object|String)} attributesToShow an object of attributes to show or a string "showAll" or "ignore"
 * @param {Function} callRequestGfi a function (mimeType, url) to call the wms url with
 * @returns {Object[]}  a list of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
export function getXmlFeatures (url, layerName, gfiTheme, gfiIconPath, attributesToShow, callRequestGfi) {
    if (typeof url !== "string" || typeof callRequestGfi !== "function") {
        return [];
    }
    return callRequestGfi("text/xml", url).then(featureInfos => {
        let result = [];

        if (Array.isArray(featureInfos)) {
            featureInfos.forEach(function (feature) {
                if (typeof feature === "object" && feature !== null && typeof feature.getProperties === "function") {
                    result.push(createGfiFeature(layerName, gfiTheme, gfiIconPath, attributesToShow, feature.getProperties(), null, feature.getId()));
                }
            });
        }

        // Create a merged feature because some themes might display multiple features at once
        if (result.length > 0 && ["DataTable"].indexOf(gfiTheme) !== -1) {
            result = [createGfiFeature(layerName, gfiTheme, gfiIconPath, attributesToShow, result, null, null)];
        }

        return result;
    });
}

/**
 * returns a list of objects representing the features called by url
 * @param {String} url the url to call the wms features from
 * @param {String} layerName the name of the requesting layer
 * @param {String} gfiTheme the title of the theme - it does not check if the theme exists
 * @param {String} gfiIconPath path to icon used as fallback
 * @param {(Object|String)} attributesToShow an object of attributes to show or a string "showAll" or "ignore"
 * @param {Function} callRequestGfi a function (mimeType, url) to call the wms url with
 * @returns {Object[]}  a list of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
export function getHtmlFeature (url, layerName, gfiTheme, gfiIconPath, attributesToShow, callRequestGfi) {
    if (typeof url !== "string" || typeof callRequestGfi !== "function") {
        return [];
    }
    return callRequestGfi("text/html", url).then(document => {
        if (typeof document !== "undefined" && document.getElementsByTagName("tbody")[0].children.length >= 1) {
            return [createGfiFeature(layerName, gfiTheme, gfiIconPath, attributesToShow, null, null, undefined, url)];
        }
        return [];
    });
}

/**
 * create an object representing a feature
 * @param {String} layerName the name of the requesting layer
 * @param {String} gfiTheme the title of the theme - it does not check if the theme exists
 * @param {String} gfiIconPath path to icon used as fallback
 * @param {(Object|String)} attributesToShow an object of attributes to show or a string "showAll" or "ignore"
 * @param {?Object} featureProperties an object with the data of the feature as simple key/value pairs
 * @param {Object} [gfiFormat=null] the gfiFormat as defined at the layer
 * @param {String} [id=""] id the id of the feature
 * @param {String} [url=""] the url to call the wms features from
 * @param {String} [layerId=""] the ID from the layer
 * @returns {Object} an object{getTitle, getTheme, getIconPath, getAttributesToShow, getProperties, getGfiFormat, getId, getGfiUrl, getLayerId}
 */
export function createGfiFeature (layerName, gfiTheme, gfiIconPath, attributesToShow, featureProperties, gfiFormat = null, id = "", url = "", layerId = "") {
    return {
        getTitle: () => layerName,
        getTheme: () => gfiTheme,
        getIconPath: () => gfiIconPath,
        getAttributesToShow: () => attributesToShow,
        getProperties: () => featureProperties,
        getGfiFormat: () => gfiFormat,
        getId: () => id,
        getGfiUrl: () => url,
        getLayerId: () => layerId
    };
}

export default {getWmsFeaturesByMimeType, openFeaturesInNewWindow, getXmlFeatures, createGfiFeature};
