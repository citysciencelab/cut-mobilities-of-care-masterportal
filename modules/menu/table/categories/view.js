import Template from "text-loader!./template.html";

const CategoryView = Backbone.View.extend({
    events: {
        "click #table-nav-cat-panel-toggler": "toggleCategoryMenu"
    },
    initialize: function () {
        var channel = Radio.channel("Filter");

        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementCategory": this.hideCategoryMenu
        });

        this.$el.on("show.bs.collapse", function () {
            Radio.request("TableMenu", "setActiveElement", "Category");
        });

        channel.on({
            "disable": this.disableCategoryButton,
            "enable": this.enableCategoryButton
        }, this);

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
        else if (!$(".table-category-list").hasClass("disableCategoryButton")) {
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
    },
    disableCategoryButton: function () {
        $("#table-nav-cat-panel-icon").addClass("disableCategoryIcon");
        $(".table-category-list").addClass("disableCategoryButton");
    },
    enableCategoryButton: function () {
        $("#table-nav-cat-panel-icon").removeClass("disableCategoryIcon");
        $(".table-category-list").removeClass("disableCategoryButton");
    }
});

export default CategoryView;
