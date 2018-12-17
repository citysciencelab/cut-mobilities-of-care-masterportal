import MainTemplate from "text-loader!./main/template.html";
import TableNavModel from "./model";
import LayerListView from "./layer/listView";
import CategoryList from "./categories/view";
import ToolView from "./tool/view";
import CloseClickView from "./closeClickView";

const Menu = Backbone.View.extend({
    initialize: function () {
        this.render();
        this.renderLayerList();
        this.renderCategoryList();
        this.renderTools();
        this.hideContextMenu();
    },
    model: new TableNavModel(),
    id: "table-nav",
    className: "table-nav",
    template: _.template(MainTemplate),
    render: function () {
        $(this.el).html(this.template());
        $(".lgv-container").append(this.$el);

        new CloseClickView().render();

        return this;
    },
    renderLayerList: function () {
        this.$el.find("#table-nav-main").append(new LayerListView().render().$el);
    },
    renderCategoryList: function () {
        this.$el.append(new CategoryList().$el);
    },
    renderTools: function () {
        new ToolView();
    },
    hideContextMenu: function () {
        $("body").attr("oncontextmenu", "return false;");
    }
});

export default Menu;
