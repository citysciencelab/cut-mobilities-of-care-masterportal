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
    mouseWheelUp,
    mouseWheelDown,
    isFullscreen,
    getCenter,
    getResolution
};

/* eslint-enable prefer-rest-params */
