require.config({
    waitSeconds: 60,
    paths: {
        jquery: "../../components/jquery/dist/jquery",
        jqueryui: "../../components/jquery-ui/ui",
        underscore: "../../components/underscore/underscore",
        "underscore.string": "../../components/underscore.string/dist/underscore.string.min",
        backbone: "../../components/backbone/backbone",
        "backbone.radio": "../../components/backbone.radio/build/backbone.radio.min",
        text: "../../components/requirejs-text/text",
        bootstrap: "../../components/bootstrap/js",
        eventbus: "../../js/EventBus",
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
