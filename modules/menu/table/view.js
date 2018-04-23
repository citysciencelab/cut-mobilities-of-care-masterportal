define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        MainTemplate = require("text!modules/menu/table/main/template.html"),
        $ = require("jquery"),
        ToolView = require("modules/menu/table/tool/view"),
        Menu;

  Menu = Backbone.View.extend({
      collection: {},
      id: "table-nav",
      className: "table-nav",
      template: _.template(MainTemplate),
      initialize: function () {
          this.render();
          this.renderTool();
      },
      render: function () {
          $(this.el).html(this.template());
          $(".lgv-container").append(this.$el);
      },
      renderTool: function() {
          this.$el.append(new ToolView().render());
      },
  });
  return Menu;
});
