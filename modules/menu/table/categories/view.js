
define(function (require) {

    var Template = require("text!modules/menu/table/categories/Templates/template.html"),
        $ = require("jquery"),
        CategoryView;

    CategoryView = Backbone.View.extend({
        id: "table-category-list",
        className: "table-category-list table-nav",
        template: _.template(Template),
        events: {
            "click": "toggleCategoryMenu"
        },
        initialize: function () {
            this.listenTo(Radio.channel("TableMenu"), {
                "hideMenuElementCategory": this.hideCategoryMenu
            });

            this.$el.on("show.bs.collapse", function () {
                Radio.request("TableMenu", "setActiveElement", "Category");
            });
        },
        toggleCategoryMenu: function () {
            if ($(".table-nav-cat-panel").hasClass("in")) {
                this.hideCategoryMenu();
            }
            else {
                this.showCategoryMenu();
            }
        },
        hideCategoryMenu: function () {
            $(".table-nav-cat-panel").removeClass("in");
            $(".table-category-list").removeClass("table-category-active");
        },
        showCategoryMenu: function () {
            $(".table-category-list").addClass("table-category-active");
            $(".table-nav-cat-panel").addClass("in");
            Radio.request("TableMenu", "setActiveElement", "Category");
        },
        render: function () {
            this.$el.html(this.template());
            if (Radio.request("TableMenu", "getActiveElement") === "Category") {
                $(".table-nav-cat-panel").collapse("show");
            }
            return this.$el;
        }
    });

    return CategoryView;
});