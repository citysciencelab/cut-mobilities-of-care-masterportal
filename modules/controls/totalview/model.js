define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        TotalviewModel;

  TotalviewModel = Backbone.Model.extend({
      defaults: {
        baselayer: "",
        newOvmView: ""
      },
      // wird aufgerufen wenn das Model erstellt wird
      initialize: function () {
         console.log('++++++++++++++++++++++++++++');
      }
    });

    return TotalviewModel;
});
