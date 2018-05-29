require.config({
    waitSeconds: 60,
    paths: {
        jquery: "../../node_modules/jquery/dist/jquery",
        underscore: "../../node_modules/underscore/underscore",
        backbone: "../../node_modules/backbone/backbone",
        "backbone.radio": "../../node_modules/backbone.radio/build/backbone.radio.min",
        text: "../../node_modules/requirejs-text/text",
        bootstrap: "../../node_modules/bootstrap/js",
        modules: "../../modules"
    },
    shim: {
        bootstrap: {
            deps: ["jquery"]
        }
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

define(function (require) {
    var ListView = require("listView"),
        Util = require("modules/core/util");

        new ListView();
        new Util();
});
