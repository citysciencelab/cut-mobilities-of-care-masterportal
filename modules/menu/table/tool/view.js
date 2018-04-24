define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        ToolTemplate = require("text!modules/menu/table/tool/template.html"),
        $ = require("jquery"),
        ToolView;

    ToolView = Backbone.View.extend({
        id: "table-tool",
        className: "table-tool table-nav",
        template: _.template(ToolTemplate),
        initialize: function () {
            this.render();
        },
        render: function () {
            return this.$el.html(this.template());
        }
    });

    return ToolView;
});
