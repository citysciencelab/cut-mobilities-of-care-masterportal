require.config({
    waitSeconds: 60,
    paths: {
        openlayers: "../_libs/openlayers/js/ol-debug",
        jquery: "../components/jquery/dist/jquery",
        jqueryui: "../components/jquery-ui/ui",
        underscore: "../components/underscore/underscore",
        backbone: "../components/backbone/backbone",
        text: "../components/requirejs-text/text",
        bootstrap: "../components/bootstrap/dist/js/bootstrap",
        proj4: "../components/proj4/dist/proj4",
        eventbus: "EventBus",
        views: "views",
        models: "models",
        collections: "collections",
        config: window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") +1 ) + "config",
        app: "app",
        templates: "../templates",
        modules: "../modules",
        videojs: "../_libs/video-js/video.dev"
    },
    shim: {
        jqueryui: {
            exports: "$",
            deps: ["jquery"]
        },
        bootstrap: {
            deps: ["jquery"]
        },
        openlayers: {
            exports: "ol"
        }
    },
    urlArgs: "bust=" +  (new Date()).getTime()
});

define(["app"], function () {
});
