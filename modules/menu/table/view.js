define(function (require) {
    var MainTemplate = require("text!modules/menu/table/main/template.html"),
        TableNavModel = require("modules/menu/table/model"),
        $ = require("jquery"),
        LayerListView = require("modules/menu/table/layer/listView"),
        CategoryList = require("modules/menu/table/categories/view"),
        ToolView = require("modules/menu/table/tool/view"),
        Menu;

    Menu = Backbone.View.extend({
        initialize: function () {
            this.render();
            this.renderLayerList();
            this.renderCategoryList();
            this.renderTools();
        },
        model: new TableNavModel(),
        id: "table-nav",
        className: "table-nav",
        template: _.template(MainTemplate),
        render: function () {
            $(this.el).html(this.template());
            $(".lgv-container").append(this.$el);

            return this;
        },
        renderLayerList: function () {
            this.$el.find("#table-nav-main").append(new LayerListView().render());
        },
        renderCategoryList: function () {
            this.$el.append(new CategoryList().render());
        },
        renderTools: function () {
            new ToolView();
        }
    });
    return Menu;
});
