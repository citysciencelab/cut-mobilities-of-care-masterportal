require.config({
    waitSeconds: 60,
    paths: {
        openlayers: "../node_modules/openlayers/dist/ol-debug",
        jquery: "../node_modules/jquery/dist/jquery.min",
        jqueryui: "../node_modules/jquery-ui/ui",
        underscore: "../node_modules/underscore/underscore-min",
        "underscore.string": "../node_modules/underscore.string/dist/underscore.string.min",
        backbone: "../node_modules/backbone/backbone",
        "backbone.radio": "../node_modules/backbone.radio/build/backbone.radio.min",
        text: "../node_modules/requirejs-text/text",
        bootstrap: "../node_modules/bootstrap/js",
        colorpicker: "../node_modules/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min",
        proj4: "../node_modules/proj4/dist/proj4",
        videojs: "../node_modules/video.js/dist/video",
        moment: "../node_modules/moment/min/moment.min",
        geoapi: "GeoAPI",
        config: window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) + "config",
        app: "app",
        templates: "../templates",
        modules: "../modules",
        d3: "../node_modules/d3/build/d3.min"
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

define(["app"], function () {
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
