define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        MainTemplate = require("text!modules/menu/table/main/template.html"),
        $ = require("jquery"),
        Menu;

  Menu = Backbone.View.extend({
      collection: {},
      id: "table-nav",
      className: "table-nav",
      template: _.template(MainTemplate),
      initialize: function () {
          this.render();
      },
      render: function () {
          $(this.el).html(this.template());
          $(".lgv-container").append(this.$el);
      }
  });
  return Menu;
});
