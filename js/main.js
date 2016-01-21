require.config({
    waitSeconds: 60,
    paths: {
        openlayers: "../components/ol3-bower/ol",
        jquery: "../components/jquery/dist/jquery",
        jqueryui: "../components/jquery-ui/ui",
        underscore: "../components/underscore/underscore",
        backbone: "../components/backbone/backbone",
        "backbone.radio": "../components/backbone.radio/build/backbone.radio.min",
        text: "../components/requirejs-text/text",
        bootstrap: "../components/bootstrap/js",
        proj4: "../components/proj4/dist/proj4",
        videojs: "../components/video.js/dist/video-js/video",
        moment: "../components/moment/min/moment.min",
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
