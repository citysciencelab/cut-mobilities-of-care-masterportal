require.config({
    waitSeconds: 60,
    paths: {
        jquery: "../../node_modules/jquery/dist/jquery",
        jqueryui: "../../node_modules/jquery-ui/ui",
        underscore: "../../node_modules/underscore/underscore",
        "underscore.string": "../../node_modules/underscore.string/dist/underscore.string.min",
        backbone: "../../node_modules/backbone/backbone",
        "backbone.radio": "../../node_modules/backbone.radio/build/backbone.radio.min",
        text: "../../node_modules/requirejs-text/text",
        bootstrap: "../../node_modules/bootstrap/js",
        app: "app",
        modules: "../../modules",
        idaModules: "idaModules",
        config: window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) + "config"
    },
    shim: {
        bootstrap: {
            deps: ["jquery"]
        },
        "bootstrap/popover": {
            deps: ["bootstrap/tooltip"]
        }
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

define(["app"], function () {
});
