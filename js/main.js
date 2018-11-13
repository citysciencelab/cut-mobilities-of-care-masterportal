import {loadApp} from "./app";
import "../css/bootstrap.less";
// CSS-Handling: Importieren von Css damit Webpack das verarbeitet.
import "../css/style.css";
// polyfill für Promises im IE
import "es6-promise/auto";
import Alert from "../modules/alerting/view";

var scriptTags = document.getElementsByTagName("script"),
    scriptTagsArray = Array.prototype.slice.call(scriptTags),
    configPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) + "config.js",
    index,
    strippedLocation,
    loadConfigJs,
    context;

new Alert();

// wenn Config.js nicht in der index.html als Script-Tag eingebunden ist, muss sie zunächst zugefügt und geladen werden
if (!("Config" in window)) {

    // Pfad zur Config.js bei ParametricUrl
    if (window.location.search !== "") {
        index = window.location.href.indexOf("?");
        strippedLocation = window.location.href.slice(0, index);

        configPath = strippedLocation.substring(0, strippedLocation.lastIndexOf("/") + 1) + "config.js";
    }

    // Pfad zur Config.js über data-lgv-config
    scriptTagsArray.forEach(function (scriptTag) {
        if (scriptTag.getAttribute("data-masterportal-config") !== null) {
            // ?noext notwendig, damit nicht automatisch von Require ein .js an den Pfad angehängt wird!
            configPath = scriptTag.getAttribute("data-masterportal-config") + "?noext";
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

    // Abwarten bis Config.js geladen ist, dann app laden
    loadConfigJs.then(() => {
        loadApp();
    });

    loadConfigJs.catch(() => {
        Radio.trigger("Alert", "alert", "Entschuldigung, die Konfiguration konnte nicht vom Pfad '" + configPath + "'' geladen werden. Bitte wenden sie sich an den Administrator.");
    });
}
else {
    loadApp();
}


// Less-Handling: Importieren von allen less-Files im modules-Ordner
context = require.context("../modules/", true, /.+\.less?$/);

context.keys().forEach(context);

export default context;
