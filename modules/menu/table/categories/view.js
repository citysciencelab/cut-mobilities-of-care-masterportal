
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
                "hideMenuElementCategory": this.hideMenu
            });

            this.$el.on("show.bs.collapse", function () {
                Radio.request("TableMenu", "setActiveElement", "Category");
            });
        },
        toggleCategoryMenu: function () {
            if ($(".table-nav-cat-panel").hasClass("in")) {
                this.hideMenu();
            }
            else {
                $(".table-nav-cat-panel").addClass("in");
                Radio.request("TableMenu", "setActiveElement", "Category");
            }
        },
        hideMenu: function () {
            $(".table-nav-cat-panel").removeClass("in");
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