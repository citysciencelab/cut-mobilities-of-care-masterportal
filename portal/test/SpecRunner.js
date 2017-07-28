require.config({
  paths: {
    jquery: "../../components/jquery/dist/jquery.min",
    underscore: "../../components/underscore/underscore-min",
    backbone: "../../components/backbone/backbone",
    openlayers: "../../components/openlayers/ol-debug",
    proj4: "../../components/proj4/dist/proj4",
    "backbone.radio": "../../components/backbone.radio/build/backbone.radio.min",
    'mocha'         : 'mocha/mocha',
    'chai'          : 'chai/chai'
  }
});

define(function(require) {
    require('mocha');
    require('jquery');

    require("openlayers");
    require("backbone");

    mocha.setup('bdd');

    require([
    'test.js'
    ], function(require) {
        mocha.run();
    });

});
