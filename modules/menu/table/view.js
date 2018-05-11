define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        MainTemplate = require("text!modules/menu/table/main/template.html"),
        $ = require("jquery"),
        LayerListView = require("modules/menu/table/layer/listView"),
        ToolView = require("modules/menu/table/tool/view"),
        Menu;

    Menu = Backbone.View.extend({
        collection: {},
        id: "table-nav",
        className: "table-nav",
        template: _.template(MainTemplate),
        initialize: function () {
            this.render();
            this.renderLayerList();
            this.renderTools();
        },
        render: function () {
            $(this.el).html(this.template());
            $(".lgv-container").append(this.$el);
        },
        renderLayerList: function () {
            this.$el.find("#table-nav-main").append(new LayerListView().render());
        },
        renderTools: function () {
            new ToolView();
        }
    });
        return Menu;
    });
