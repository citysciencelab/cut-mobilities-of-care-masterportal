define(function (require) {

  var BackForwardModel = require("modules/controls/backforward/model"),
      Radio = require("backbone.radio"),
      Backbone  = require("backbone"),
      BackForwardView;

  BackForwardView = Backbone.View.extend({
      template: _.template("<div class='backForwardButtons'><span class='glyphicon glyphicon-chevron-right' title='Vor springen'></span><br><span class='glyphicon glyphicon-chevron-left' title='Zurück springen'></span><div>"),
      id: "backforwardview",
      events: {
          "click .glyphicon-chevron-right": "setNextView",
          "click .glyphicon-chevron-left": "setLastView"
      },
      initialize: function () {
          console.log('#######jo');
          var channel = Radio.channel("BackForwardView");

          this.model = new BackForwardModel();
          this.render();
      },
      render: function () {
          this.$el.html(this.template());
      },
      setNextView: function () {
          console.log('Funktion setNextView');
          //Angaben (mapView.startCenter, mapView.extent, mapView.zoomLevel) aus config.json auslesen
          //var center = Radio.request("Parser", "getPortalConfig").mapView.startCenter;
          //var zoomlevel = Radio.request("Parser", "getPortalConfig").mapView.zoomLevel;
          //console.log(center);
          //console.log(zoomlevel);
          //Radio.trigger("MapView", "setCenter", center, zoomlevel);
      },
      setLastView: function () {
          console.log('Funktion setLastView');
      } 
	  
  });

    return BackForwardView;
});
