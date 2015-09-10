require.config({
    waitSeconds: 60,
    paths: {
        openlayers: "../_libs/openlayers/v3.5.0/ol-debug",
        jquery: "../components/jquery/dist/jquery",
        jqueryui: "../components/jquery-ui/ui",
        underscore: "../components/underscore/underscore",
        backbone: "../components/backbone/backbone",
        text: "../components/requirejs-text/text",
        bootstrap: "../components/bootstrap/js",
        proj4: "../components/proj4/dist/proj4",
        videojs: "../components/video.js/dist/video-js/video",
        eventbus: "EventBus",
        geoapi: "GeoAPI",
        views: "views",
        models: "models",
        collections: "collections",
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
        }
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

define(["app"], function () {
});
