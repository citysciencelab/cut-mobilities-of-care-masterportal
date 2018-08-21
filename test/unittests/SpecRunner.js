require.config({
    paths: {
        jquery: "../../node_modules/jquery/dist/jquery.min",
        jqueryui: "../../node_modules/jquery-ui/ui",
        underscore: "../../node_modules/underscore/underscore-min",
        "underscore.string": "../../node_modules/underscore.string/dist/underscore.string.min",
        backbone: "../../node_modules/backbone/backbone",
        openlayers: "../../node_modules/openlayers/dist/ol-debug",
        proj4: "../../node_modules/proj4/dist/proj4",
        d3: "../../node_modules/d3/build/d3.min",
        "backbone.radio": "../../node_modules/backbone.radio/build/backbone.radio.min",
        mocha: "../../node_modules/mocha/mocha",
        chai: "../../node_modules/chai/chai",
        html2canvas: "../../node_modules/html2canvas/dist/html2canvas.min",
        "promise-polyfill": "../../node_modules/promise-polyfill/dist/polyfill.min",
        modules: "../../modules",
        util: "util",
        originUtil: "../../modules/core/util",
        config: "testConfig",
        moment: "../../node_modules/moment/min/moment-with-locales.min",
        services: "resources/testServices.json",
        bootstrap: "../../node_modules/bootstrap/js",
        mqtt: "../../node_modules/mqtt/dist/mqtt",
        text: "../../node_modules/requirejs-text/text",
        pdfmake: "../../node_modules/pdfmake/build/pdfmake"
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

define(function (require) {
    require("mocha");
    require("jquery");

    require("openlayers");

    mocha.setup("bdd");
    require(["backbone", "backbone.radio"], function () {
        Radio = Backbone.Radio;
        /** load testfiles here **/
        require([
            /* ******** load Testfiles here!!!**********/
            "modules/tools/download/testModel.js",
            "modules/mouseHover/testModel.js",
            "modules/searchbar/testModel.js",
            "modules/searchbar/testSpecialWFSModel.js",
            "modules/tools/filter/query/source/testWfs.js",
            "modules/tools/filter/query/testModel.js",
            "modules/tools/filter/testFilter.js",
            "modules/snippets/slider/testModel.js",
            "modules/tools/gfi/themes/elektroladesaeulen/testModel.js",
            "modules/tools/gfi/themes/testModel.js",
            "modules/tools/gfi/themes/schulinfo/testModel.js",
            "modules/tools/gfi/themes/verkehrsstaerken_rad/testModel.js",
            "modules/core/testMap.js",
            "modules/core/testParametricUrl.js",
            "modules/core/modelList/layer/testGeoJson.js",
            "modules/core/modelList/layer/testSensor.js",
            "modules/core/modelList/testList.js",
            "modules/contact/testModel.js",
            "modules/core/testRawLayerList.js",
            "modules/controls/orientation/testPoiModel.js",
            "modules/vectorStyle/testModel.js",
            "modules/tools/getCoord/testModel.js",
            "modules/core/testCRS.js",
            "modules/core/testWPS.js",
            "modules/core/testUtil.js",
            "modules/alerting/testModel.js",
            "modules/tools/einwohnerabfrage/testModel.js",
            "modules/tools/schulwegrouting_hh/testModel.js",
            "modules/tools/parcelSearch/testModel.js",
            "modules/tools/einwohnerabfrage/testModel.js",
            "modules/tools/parcelSearch/testModel.js",
            "modules/core/configLoader/testParserCustomTree.js",
            "modules/core/configLoader/testParserDefaultTree.js",
            "modules/core/configLoader/testPreparser.js",
            "modules/menu/desktop/folder/testViewTree.js",
            "modules/menu/mobile/folder/testView.js",
            "modules/core/testUtil.js",
            "modules/tools/schulwegrouting_hh/testModel.js",
            "modules/tools/compareFeatures/testModel.js",
            "modules/menu/mobile/folder/testView.js",
            "modules/tools/graph/testModel.js",
            "modules/functionalities/browserPrint/testModel.js",
            "modules/tools/searchByCoord/testModel.js",
            "modules/legend/legendModel.js"
        ], function () {
            mocha.run();
        });
    });
});
