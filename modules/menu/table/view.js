define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        MainTemplate = require("text!modules/menu/table/main/template.html"),
        $ = require("jquery"),
        LayerView = require("modules/menu/table/layer/view"),
        ToolView = require("modules/menu/table/tool/view"),
        ListView = require("modules/menu/table/listViewLight"),
        Menu;

    Menu = Backbone.View.extend({
        collection: {},
        id: "table-nav",
        className: "table-nav",
        template: _.template(MainTemplate),
        initialize: function () {
            this.render();
            this.renderLayer();
            this.renderList();
            this.renderTool();
        },
        render: function () {
            $(this.el).html(this.template());
            $("#tree").remove();
            $(".lgv-container").append(this.$el);
        },
        renderLayer: function () {
            this.$el.find("#table-nav-main").append(new LayerView().render());
        },
         renderList: function () {
            new ListView().render();
        },
        renderTool: function () {
            this.$el.append(new ToolView().render());
        }
    });
        return Menu;
    });
