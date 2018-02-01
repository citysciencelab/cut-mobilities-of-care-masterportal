define(function (require) {

  var TotalviewModel = require("modules/controls/totalview/model"),
      Radio = require("backbone.radio"),
      Backbone  = require("backbone"),
      TotalView;

  TotalView = Backbone.View.extend({
      template: _.template("<div class='total-view-button'><span class='glyphicon glyphicon-record' title='Gesamtansicht anzeigen'></span></div>"),
      id: "totalview",
      events: {
          "click .glyphicon-record": "setTotalView"
      },
      initialize: function () {
          console.log('#######jo');
          var channel = Radio.channel("TotalView");

          this.model = new TotalviewModel();
          this.render();
      },
      render: function () {
          this.$el.html(this.template());
      },
      setTotalView: function () {
          console.log('Funktion setTotalView');
          //Angaben (mapView.startCenter, mapView.extent, mapView.zoomLevel) aus config.json auslesen
          var center = Radio.request("Parser", "getPortalConfig").mapView.startCenter;
          var zoomlevel = Radio.request("Parser", "getPortalConfig").mapView.zoomLevel;
          console.log(center);
          console.log(zoomlevel);
          Radio.trigger("MapView", "setCenter", center, zoomlevel);
      }
  });

    return TotalView;
});
