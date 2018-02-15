require.config({
  paths: {
    jquery: "../../node_modules/jquery/dist/jquery.min",
    underscore: "../../node_modules/underscore/underscore-min",
    backbone: "../../node_modules/backbone/backbone",
    openlayers: "../../node_modules/openlayers/dist/ol-debug",
    proj4: "../../node_modules/proj4/dist/proj4",
    "backbone.radio": "../../node_modules/backbone.radio/build/backbone.radio.min",
    mocha: "../../node_modules/mocha/mocha",
    chai: "../../node_modules/chai/chai",
    modules: "../../modules",
    util: "util",
    config: "testConfig",
    moment: "../../node_modules/moment/min/moment.min",
    bootstrap: "../../node_modules/bootstrap/js",
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
    }
});

define(function(require) {
    require("mocha");
    require("jquery");

    require("openlayers");
    require("backbone");
    require("backbone.radio");

    mocha.setup("bdd");
    require([
    /********* load Testfiles here!!!**********/
    "modules/tools/download/testModel.js",
    "modules/mouseHover/testModel.js",
    "modules/searchbar/testModel.js",
    "modules/tools/filter/query/source/testWfs.js",
    "modules/tools/filter/testFilter.js",
    "modules/snippets/slider/testModel.js",
    "modules/tools/gfi/themes/schulinfo/testModel.js",
    "modules/core/testMap.js",
    "modules/core/modelList/testList.js"
    ], function (require) {
        Radio = Backbone.Radio;
        mocha.run();
    });

});
