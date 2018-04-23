define(function (require) {

  var Radio = require("backbone.radio"),
      Backbone = require("backbone"),
      Model = require("modules/controls/totalview/model"),
      TotalView;

  TotalView = Backbone.View.extend({
      template: _.template("<div class='total-view-button'><span class='glyphicon glyphicon-fast-backward' title='Gesamtansicht anzeigen'></span></div>"),
      model: new Model(),
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
        var center = this.model.getStartCenter(),
            zoomlevel = this.model.getZoomLevel();

        Radio.trigger("MapView", "setCenter", center, zoomlevel);
      }
  });

    return TotalView;
});
