/**
 * @description View for categories in table mode
 * @module CategoryView
 * @extends Backbone.View
 */
import Template from "text-loader!./template.html";

const CategoryView = Backbone.View.extend({
    events: {
        "click #table-nav-cat-panel-toggler": "toggleCategoryMenu"
    },
    initialize: function () {
        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementCategory": this.hideCategoryMenu
        });

        this.$el.on("show.bs.collapse", function () {
            Radio.request("TableMenu", "setActiveElement", "Category");
        });

        this.render();
    },
    render: function () {
        this.$el.html(this.template());
        if (Radio.request("TableMenu", "getActiveElement") === "Category") {
            this.$(".table-nav-cat-panel").collapse("show");
        }
        return this;
    },
    id: "table-category-list",
    className: "table-category-list table-nav",
    template: _.template(Template),
    toggleCategoryMenu: function () {
        if (this.$(".table-nav-cat-panel").hasClass("in")) {
            this.hideCategoryMenu();
        }
        else {
            this.showCategoryMenu();
        }
    },
    hideCategoryMenu: function () {
        this.$(".table-nav-cat-panel").removeClass("in");
        this.$(".table-category-list").removeClass("table-category-active");
        Radio.trigger("TableMenu", "deactivateCloseClickFrame");
    },
    showCategoryMenu: function () {
        this.$(".table-category-list").addClass("table-category-active");
        this.$(".table-nav-cat-panel").addClass("in");
        this.$("div.btn-group.header").hide();
        Radio.request("TableMenu", "setActiveElement", "Category");
    }
});

export default CategoryView;
