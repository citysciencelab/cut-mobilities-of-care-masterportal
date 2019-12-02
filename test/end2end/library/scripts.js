/*
 * Scripts meant for execution within driver.executeScript function.
 * https://selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/ie_exports_Driver.html#executeScript
 */

/**
 * Scrolls the ol canvas up.
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
    const windowValue = window.innerHeight,
        screenValue = screen.availHeight,
        tolerance = 2;

    return windowValue >= screenValue - tolerance && windowValue <= screenValue + tolerance;
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
    return Backbone.Radio.request("MapView", "getOptions").resolution;
}

module.exports = {
    isFullscreen,
    getCenter,
    getResolution,
    mouseWheelCanvasUp,
    mouseWheelCanvasDown
};
