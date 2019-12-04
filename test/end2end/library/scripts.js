/*
 * Scripts meant for execution within driver.executeScript function.
 * https://selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/ie_exports_Driver.html#executeScript
 */

/**
 * Scrolls the ol canvas up.
 * Needed since selenium does not support scrolling.
 * @returns {void}
 */
function mouseWheelCanvasUp () {
    document.getElementsByTagName("canvas")[0].dispatchEvent(new WheelEvent("wheel", {
        view: window,
        bubbles: true,
        cancelable: true,
        deltaY: -100
    }));
}

/**
 * Scrolls the ol canvas down.
 * Needed since selenium does not support scrolling.
 * @returns {void}
 */
function mouseWheelCanvasDown () {
    document.getElementsByTagName("canvas")[0].dispatchEvent(new WheelEvent("wheel", {
        view: window,
        bubbles: true,
        cancelable: true,
        deltaY: 100
    }));
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

module.exports = {
    mouseWheelCanvasUp,
    mouseWheelCanvasDown,
    isFullscreen,
    getCenter,
    getResolution
};
