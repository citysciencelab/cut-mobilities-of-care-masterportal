/* eslint-disable prefer-rest-params */

/*
 * Scripts meant for execution within driver.executeScript function.
 * Rest params can not be used; see docs on why arguments is used.
 * https://selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/ie_exports_Driver.html#executeScript
 */

/**
 * Mocks the browser's GeoLocationAPI to make it usable in tests.
 * From https://github.com/janmonschke/GeoMock/blob/master/geomock.js
 */
const mockGeoLocationAPI = `
(function() {
    (function() {
        if (typeof navigator === "undefined" || navigator === null) {
            window.navigator = {};
        }
        if (navigator.geolocation == null) {
            window.navigator.geolocation = {};
        }
        navigator.geolocation.mock = true;
        navigator.geolocation.delay = 1000;
        navigator.geolocation.shouldFail = false;
        navigator.geolocation.failsAt = -1;
        navigator.geolocation.errorMessage = "There was an error retrieving the position!";
        navigator.geolocation.currentTimeout = -1;
        navigator.geolocation.lastPosReturned = 0;
        navigator.geolocation._sanitizeLastReturned = function() {
            if (this.lastPosReturned > this.waypoints.length - 1) {
                return this.lastPosReturned = 0;
            }
        };
        navigator.geolocation._geoCall = function(method, success, error) {
            var _this = this;
            if (this.shouldFail && (error != null)) {
                return this.currentTimeout = window[method].call(null, function() {
                    return error(_this.errorMessage);
                }, this.delay);
            } else {
                if (success != null) {
                    return this.currentTimeout = window[method].call(null, function() {
                        success(_this.waypoints[_this.lastPosReturned++]);
                        return _this._sanitizeLastReturned();
                    }, this.delay);
                }
            }
        };
        navigator.geolocation.getCurrentPosition = function(success, error) {
            return this._geoCall("setTimeout", success, error);
        };
        navigator.geolocation.watchPosition = function(success, error) {
            this._geoCall("setInterval", success, error);
            return this.currentTimeout;
        };
        navigator.geolocation.clearWatch = function(id) {
            return clearInterval(id);
        };
        return navigator.geolocation.waypoints = [
            { coords: { latitude: 53.553567, longitude: 9.993051, accuracy: 1500 } },
            { coords: { latitude: 53.553546, longitude: 9.993097, accuracy: 1334 } },
            { coords: { latitude: 53.553530, longitude: 9.993132, accuracy: 631 } },
            { coords: { latitude: 53.553509, longitude: 9.993175, accuracy: 361 } },
            { coords: { latitude: 53.553485, longitude: 9.993213, accuracy: 150 } },
            { coords: { latitude: 53.553469, longitude: 9.993245, accuracy: 65 } },
            { coords: { latitude: 53.553475, longitude: 9.993307, accuracy: 65 } },
            { coords: { latitude: 53.553507, longitude: 9.993374, accuracy: 65 } },
            { coords: { latitude: 53.553542, longitude: 9.993463, accuracy: 65 } },
            { coords: { latitude: 53.553574, longitude: 9.993541, accuracy: 65 } }
        ];
    })();
}).call(this);
`;

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

/**
 * Increases zoom level by 1.
 * @returns {void}
 */
function zoomIn () {
    Backbone.Radio.trigger("MapView", "setZoomLevelUp");
}

/**
 * Reduces zoom level by 1.
 * @returns {void}
 */
function zoomOut () {
    Backbone.Radio.trigger("MapView", "setZoomLevelDown");
}

module.exports = {
    mockGeoLocationAPI,
    mouseWheelUp,
    mouseWheelDown,
    isFullscreen,
    isLayerVisible,
    areLayersOrdered,
    doesLayerWithFeaturesExist,
    getCenter,
    getResolution,
    setCenter,
    zoomIn,
    zoomOut
};

/* eslint-enable prefer-rest-params */
