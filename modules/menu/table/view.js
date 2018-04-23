define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        MainTemplate = require("text!modules/menu/table/main/template.html"),
        $ = require("jquery"),
        LayerView = require("modules/menu/table/layer/view"),
        Menu;

  Menu = Backbone.View.extend({
      collection: {},
      id: "table-nav",
      className: "table-nav",
      template: _.template(MainTemplate),
      initialize: function () {
          this.render();
          this.renderLayer();
      },
      render: function () {
          $(this.el).html(this.template());
          $(".lgv-container").append(this.$el);
      },
            renderLayer: function () {
          this.$el.append(new LayerView().render());
      }
  });
  return Menu;
});
