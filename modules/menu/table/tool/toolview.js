define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        ToolTemplate = require("text!modules/menu/table/tool/tooltemplate.html"),
        $ = require("jquery"),
        ToolView;

    ToolView = Backbone.View.extend({
        id: "table-tool",
        className: "table-tool",
        template: _.template(ToolTemplate),
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            $("#table-tools-menu").append(this.$el.html(this.template(attr)));
        }
    });

    return ToolView;
});
