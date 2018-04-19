var scriptTags = document.getElementsByTagName("script"),
    scriptTagsArray = Array.prototype.slice.call(scriptTags),
    configPath = window.location.href + "config",
    Radio;

scriptTagsArray.forEach(function (scriptTag) {
    if (scriptTag.getAttribute("data-lgv-config") !== null) {
        // ?noext notwendig, damit nicht automatisch von Require ein .js an den Pfad angehängt wird!
        configPath = scriptTag.getAttribute("data-lgv-config") + "?noext";
    }
}, this);

require.config({
    waitSeconds: 60,
    paths: {
        "bootstrap-toggle": "../node_modules/bootstrap-toggle/js/bootstrap-toggle.min",
        openlayers: "../node_modules/openlayers/dist/ol-debug",
        jquery: "../node_modules/jquery/dist/jquery.min",
        jqueryui: "../node_modules/jquery-ui/ui",
        underscore: "../node_modules/underscore/underscore-min",
        "underscore.string": "../node_modules/underscore.string/dist/underscore.string.min",
        backbone: "../node_modules/backbone/backbone",
        "backbone.radio": "../node_modules/backbone.radio/build/backbone.radio.min",
        text: "../node_modules/requirejs-text/text",
        bootstrap: "../node_modules/bootstrap/js",
        "bootstrap-select": "../node_modules/bootstrap-select/dist/js/bootstrap-select.min",
        colorpicker: "../node_modules/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min",
        slider: "../node_modules/bootstrap-slider/dist/bootstrap-slider.min",
        proj4: "../node_modules/proj4/dist/proj4",
        videojs: "../node_modules/video.js/dist/video-js/video",
        moment: "../node_modules/moment/min/moment.min",
        geoapi: "GeoAPI",
        config: configPath,
        app: "app",
        templates: "../templates",
        modules: "../modules",
        d3: "../node_modules/d3/build/d3.min",
    },
    shim: {
        bootstrap: {
            deps: ["jquery"]
        },
        "bootstrap/popover": {
            deps: ["bootstrap/tooltip"]
        },
        openlayers: {
            exports: "ol"
        }
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

// Überschreibt das Errorhandling von Require so,
// dass der ursprüngliche Fehler sammt Stacjtrace ausgegeben wird.
// funktioniert obwohl der Linter meckert
requirejs.onError = function (err) {
    if (err.requireType === "timeout") {
        alert("error: " + err);
    }
    else {
        throw err;
    }
};

// zuerst libs laden, die alle Module brauchen
// die sind dann im globalen Namespace verfügbar
// https://gist.github.com/jjt/3306911
require(["backbone", "backbone.radio"], function () {
    // dann unsere app laden, die von diesen globalen libs abhängen
    Radio = Backbone.Radio;
    require(["app"]);
});
