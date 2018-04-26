require.config({
    waitSeconds: 60,
    paths: {
        openlayers: "../lib/olcesium",
        cesium: "../lib/Cesium/Cesium",
        jquery: "../components/jquery/dist/jquery.min",
        mouseeventPolyfill: "../lib/mouseevent",
        jqueryui: "../components/jquery-ui/ui",
        underscore: "../components/underscore/underscore-min",
        "underscore.string": "../components/underscore.string/dist/underscore.string.min",
        backbone: "../components/backbone/backbone",
        "backbone.radio": "../components/backbone.radio/build/backbone.radio.min",
        text: "../components/requirejs-text/text",
        bootstrap: "../components/bootstrap/js",
        colorpicker: "../components/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min",
        proj4: "../components/proj4/dist/proj4",
        videojs: "../components/video.js/dist/video-js/video",
        moment: "../components/moment/min/moment.min",
        eventbus: "EventBus",
        geoapi: "GeoAPI",
        config: window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) + "config",
        app: "app",
        templates: "../templates",
        modules: "../modules"
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
        },
        cesium: {
            exports: "Cesium"
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
