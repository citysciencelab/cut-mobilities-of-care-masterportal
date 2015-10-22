require.config({
    waitSeconds: 60,
    paths: {
        jquery: "../../components/jquery/dist/jquery",
        jqueryui: "../../components/jquery-ui/ui",
        underscore: "../../components/underscore/underscore",
        backbone: "../../components/backbone/backbone",
        text: "../../components/requirejs-text/text",
        bootstrap: "../../components/bootstrap/js",
        eventbus: "../../js/EventBus",
        app: "app"
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
