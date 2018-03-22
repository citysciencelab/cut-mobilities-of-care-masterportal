define(function (require) {

  var Radio = require("backbone.radio"),
      Backbone = require("backbone"),
      TotalView;

  TotalView = Backbone.View.extend({
      template: _.template("<div class='total-view-button'><span class='glyphicon glyphicon-fast-backward' title='Gesamtansicht anzeigen'></span></div>"),
      id: "totalview",
      events: {
          "click .glyphicon-fast-backward": "setTotalView"
      },
      initialize: function () {
          this.render();
      },
      render: function () {
          this.$el.html(this.template());
      },
      setTotalView: function () {
          var center, zoomlevel;

          center = Radio.request("Parser", "getPortalConfig").mapView.startCenter;
          zoomlevel = Radio.request("Parser", "getPortalConfig").mapView.zoomLevel;
          Radio.trigger("MapView", "setCenter", center, zoomlevel);
      }
  });

    return TotalView;
});
