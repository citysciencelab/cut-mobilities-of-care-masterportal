/* eslint-disable prefer-rest-params */

/*
 * Scripts meant for execution within driver.executeScript function.
 * Rest params can not be used; see docs on why arguments is used.
 * https://selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/ie_exports_Driver.html#executeScript
 */

/**
 * Scrolls the first given argument up.
 * Needed since selenium does not support scrolling.
 * @param {WebElement} x element to scroll
 * @returns {void}
 */
function mouseWheelUp () {
    arguments[0].dispatchEvent(new WheelEvent("wheel", {
        view: window,
        bubbles: true,
        cancelable: true,
        deltaY: -100
    }));
}

/**
 * Scrolls the first given argument down.
 * Needed since selenium does not support scrolling.
 * @param {WebElement} x element to scroll
 * @returns {void}
 */
function mouseWheelDown () {
    arguments[0].dispatchEvent(new WheelEvent("wheel", {
        view: window,
        bubbles: true,
        cancelable: true,
        deltaY: 100
    }));
}

/**
 * Checks whether a layer is visible.
 * @param {String} layerId id of layer to check
 * @param {String} [opacity="1"] expected value between 0 and 1
 * @returns {boolean} true if AND(layer exists, layer is visible, layer opacity is as expected)
 */
function isLayerVisible () {
    const map = Backbone.Radio.request("Map", "getMap"),
        expectedOpacity = typeof arguments[1] === "undefined" ? "1" : arguments[1];
    let layer = false;

    map.getLayers().forEach(l => {
        if (l.get("id") === arguments[0]) {
            layer = l;
        }
    });

    return layer
        ? layer.getVisible() && layer.getOpacity() === Number(expectedOpacity)
        : false;
}

/**
 * Checks whether layers are present in given order. Additional layers may be present.
 * @param {String[]} layerIds layers should be present left-to-right (equals bottom-to-top)
 * @returns {boolean} true if all given layers found and in requested order
 */
function areLayersOrdered () {
    const layerIds = arguments[0],
        map = Backbone.Radio.request("Map", "getMap");

    map.getLayers().forEach(l => {
        if (l.get("id") === layerIds[0]) {
            layerIds.shift();
        }
    });

    return layerIds.length === 0;
}

/**
 * Checks whether a layer exists with the specified features.
 * @param {object[]} features feature-defining array; following object fields are checked
 *                            "coordinate": whether the feature is at this coordinate
 *                            "image": whether the feature is styled to have this image set (optional)
 *                            add more fields as needed
 * @returns {boolean} true if a layer was found that holds all features as specified
 */
function doesLayerWithFeaturesExist () {
    const map = Backbone.Radio.request("Map", "getMap"),
        searched = arguments[0];
    let found = false;

    map.getLayers().forEach(layer => {
        if (found) {
            return;
        }

        // if all searched features are found, mark found=true
        for (const {coordinate, image} of searched) {
            const features = layer.getSource && layer.getSource().getFeatures && layer.getSource().getFeatures();

            if (!features) {
                return;
            }

            let feature = null;

            for (const option of features) {
                const currentCoordinate = option.getGeometry().flatCoordinates;

                if (currentCoordinate && coordinate[0] === currentCoordinate[0] && coordinate[1] === currentCoordinate[1]) {
                    feature = option;
                    break;
                }
            }

            // if no feature at coordinate or feature does not have matching set image, it's not the right feature
            if (!feature || (image && feature.getStyle().getImage().iconImage_.src_ !== image)) {
                return;
            }
        }

        found = true;
    });

    return found;
}

/**
 * Checks whether browser is in fullscreen mode.
 * @returns {boolean} true if fullscreen is detected
 */
function isFullscreen () {
    // should be used according to MDN https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
    return Boolean(document.fullscreenElement);
}

/**
 * @returns {ol/coordinate~Coordinate} center coordinate
 */
function getCenter () {
    return Backbone.Radio.request("MapView", "getCenter");
}

/**
 * @returns {Number} current resolution of MapView
 */
function getResolution () {
    const options = Backbone.Radio.request("MapView", "getOptions");

    return options ? options.resolution : null;
}

/**
 * @param {Number[]} coords target coordinates
 * @returns {void}
 */
function setCenter () {
    Backbone.Radio.trigger("MapView", "setCenter", arguments[0]);
}

module.exports = {
    mouseWheelUp,
    mouseWheelDown,
    isFullscreen,
    isLayerVisible,
    areLayersOrdered,
    doesLayerWithFeaturesExist,
    getCenter,
    getResolution,
    setCenter
};

/* eslint-enable prefer-rest-params */
