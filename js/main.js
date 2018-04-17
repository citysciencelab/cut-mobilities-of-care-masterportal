var Radio;

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
        videojs: "../node_modules/video.js/dist/video",
        videojsflash: "../node_modules/videojs-flash/dist/videojs-flash",
        // "videojs-contrib-dash": "../node_modules/videojs-contrib-dash/dist/videojs-dash.min",
        // "videojs-contrib-hls": "../node_modules/videojs-controib-hls/dist/videojs-contrib-hls.min",
        // "videojs-contrib-media-sources": "../node_modules/videojs-contrib-media-sources/dist/videojs-contrib-media-sources.min",
        // dashjs: "../node_modules/dashjs/dist/dash.all.min",
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
        },
        videojs: {
            exports: "video.js"
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
