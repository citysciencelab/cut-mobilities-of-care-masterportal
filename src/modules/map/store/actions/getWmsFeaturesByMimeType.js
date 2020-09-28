import {requestGfi} from "../../../../api/wmsGetFeatureInfo";

/**
 * returns a list of wms features for the given url and mimeType
 * @param {String} mimeType the infoFormat of the wms (either text/xml or text/html)
 * @param {String} url the url to call the wms features from
 * @param {String} layerName the name of the requesting layer
 * @param {String} gfiTheme the title of the theme - it does not check if the theme exists
 * @param {(Object|String)} attributesToShow an object of attributes to show or a string "showAll" or "ignore"
 * @param {Object} gfiAsNewWindow null or an object of how to open the gfi in a new window
 * @param {String} [gfiAsNewWindow.name="_blank"] the browsing context or the target attribute to open the window (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
 * @param {String} [gfiAsNewWindow.specs=""] a comma-separated list of items - the setup to open the window with (see https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
 * @param {Function} [requestGfiOpt=null] a function (mimeType, url) to call the wms url with (for testing only)
 * @param {Function} [openWindowOpt=null] a function (url, name, specs) to open a new browser window with if gfiAsNewWindow is given (for testing only)
 * @returns {Object[]}  a list of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
export function getWmsFeaturesByMimeType (mimeType, url, layerName, gfiTheme, attributesToShow, gfiAsNewWindow, requestGfiOpt = null, openWindowOpt = null) {
    if (openFeaturesInNewWindow(url, gfiAsNewWindow, typeof openWindowOpt === "function" ? openWindowOpt : window.open) === true) {
        return [];
    }

    if (mimeType === "text/xml") {
        return getXmlFeatures(url, layerName, gfiTheme, attributesToShow, typeof requestGfiOpt === "function" ? requestGfiOpt : requestGfi);
    }

    // mimeType === "text/html"
    return [createGfiFeature(layerName, gfiTheme, attributesToShow, null, undefined, url)];
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
 * @param {(Object|String)} attributesToShow an object of attributes to show or a string "showAll" or "ignore"
 * @param {Function} callRequestGfi a function (mimeType, url) to call the wms url with
 * @returns {Object[]}  a list of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
export function getXmlFeatures (url, layerName, gfiTheme, attributesToShow, callRequestGfi) {
    if (typeof url !== "string" || typeof callRequestGfi !== "function") {
        return [];
    }
    return callRequestGfi("text/xml", url).then(featureInfos => {
        const result = [];

        if (Array.isArray(featureInfos)) {
            featureInfos.forEach(function (feature) {
                if (typeof feature === "object" && feature !== null && typeof feature.getProperties === "function") {
                    result.push(createGfiFeature(layerName, gfiTheme, attributesToShow, feature.getProperties(), feature.getId(), url));
                }
            });
        }
        return result;
    });
}

/**
 * create an object representing a feature
 * @param {String} layerName the name of the requesting layer
 * @param {String} gfiTheme the title of the theme - it does not check if the theme exists
 * @param {(Object|String)} attributesToShow an object of attributes to show or a string "showAll" or "ignore"
 * @param {Object} featureProperties an object with the data of the feature as simple key/value pairs
 * @param {String} [id=""] id the id of the feature
 * @param {String} [url=""] the url to call the wms features from
 * @returns {Object} an object{getTheme, getTitle, getAttributesToShow, getProperties, getId, getGfiUrl}
 */
export function createGfiFeature (layerName, gfiTheme, attributesToShow, featureProperties, id = "", url = "") {
    return {
        getTitle: () => layerName,
        getTheme: () => gfiTheme,
        getAttributesToShow: () => attributesToShow,
        getProperties: () => featureProperties,
        getId: () => id,
        getGfiUrl: () => url
    };
}

export default {getWmsFeaturesByMimeType, openFeaturesInNewWindow, getXmlFeatures, createGfiFeature};
