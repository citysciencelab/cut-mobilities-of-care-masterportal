define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        ItemTemplate = require("text!modules/menu/table/tool/template.html"),
        $ = require("jquery"),
        ItemView;

    ItemView = Backbone.View.extend({
        id : "table-tool",
        className: "table-tool table-nav",
        template: _.template(ItemTemplate),
        initialize: function () {
            this.render();
        },
        render: function () {
            $('#table-nav').append(this.$el.html(this.template()));
        }
    });

    return ItemView;
});
