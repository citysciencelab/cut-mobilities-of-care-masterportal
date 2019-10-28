/**
 * @file
 * <h1>Welcome to the Open Source Project "Masterportal" of the [Landesbetrieb Geoinformation und Vermessung]{@link http://www.geoinfo.hamburg.de}</h1>
 */
import "@babel/polyfill";
import {fetch} from "./layerList";
import "../css/bootstrap.less";
// CSS-Handling: Importieren von Css damit Webpack das verarbeitet.
import "../css/style.css";
// polyfill für Promises im IE
import "es6-promise/auto";

var scriptTags = document.getElementsByTagName("script"),
    scriptTagsArray = Array.prototype.slice.call(scriptTags),
    configPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) + "config.js",
    strippedLocation,
    loadConfigJs,
    context;

// wenn Config.js nicht in der index.html als Script-Tag eingebunden ist, muss sie zunächst zugefügt und geladen werden
if (!("Config" in window)) {

    // Pfad zur Config.js bei ParametricUrl
    if (window.location.search !== "") {
        strippedLocation = window.location.href.split("?").shift();

        // GET parameters are there for a reason - do not drop them!
        configPath = strippedLocation.substring(0, strippedLocation.lastIndexOf("/") + 1) + "config.js" + window.location.search;
    }

    // add mouseevent polyfill to fix ie11 clickhandler
    // for 3d mode
    (function (window) {
        if (typeof window.CustomEvent === "function") {
            return false; // If not IE
        }

        // Polyfills DOM4 MouseEvent

        /**
         * MouseEvent
         * @param {String} eventType parameter
         * @param {Object} params parameter
         * @returns {Event} mouseEvent
         * @constructor
         */
        function MouseEvent (eventType, params) {
            const paramsObj = params || {bubbles: false, cancelable: false},
                mouseEvent = document.createEvent("MouseEvent");

            mouseEvent.initMouseEvent(eventType, paramsObj.bubbles, paramsObj.cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

            return mouseEvent;
        }

        MouseEvent.prototype = Event.prototype;

        window.MouseEvent = MouseEvent;
        return true;
    })(window);
    // Pfad zur Config.js über data-lgv-config
    scriptTagsArray.forEach(function (scriptTag) {
        if (scriptTag.getAttribute("data-masterportal-config") !== null) {
            // ?noext notwendig, damit nicht automatisch von Require ein .js an den Pfad angehängt wird!
            configPath = scriptTag.getAttribute("data-masterportal-config");

            if (window.location.search !== "") {
                // GET parameters are there for a reason - do not drop them!
                configPath = configPath.split("?");
                configPath = configPath.shift() + "?" + configPath.concat([window.location.search.slice(1)]).join("&");
            }

            configPath += (configPath.indexOf("?") !== -1 ? "&" : "?") + "noext";
        }
    }, this);

    // Config.js laden
    loadConfigJs = new Promise((resolve, reject) => {
        const script = document.createElement("script");

        document.body.appendChild(script);
        script.onload = resolve;
        script.onerror = reject;
        script.async = true;
        script.src = configPath;
    });

    // Abwarten bis Config.js geladen ist, dann layer list laden
    loadConfigJs.then(() => {
        fetch(Config.layerConf);
    });

    // Show error message without Alerting
    loadConfigJs.catch(() => {
        document.getElementById("loader").style.visibility = "hidden";
        document.getElementById("map").appendChild(document.createTextNode("Die Portalkonfiguration konnte nicht vom Pfad '" + configPath + "'' geladen werden. Bitte wenden sie sich an den Administrator."));
    });
}
else {
    fetch(Config.layerConf);
}

// Less-Handling: Importieren von allen less-Files im modules-Ordner
context = require.context("../modules/", true, /.+\.less?$/);

context.keys().forEach(context);

export default context;
