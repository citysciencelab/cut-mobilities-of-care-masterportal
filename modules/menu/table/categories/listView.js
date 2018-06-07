
define(function (require) {

    var Backbone = require("backbone"),
        _ = require("underscore"),
        Template = require("text!modules/menu/table/categories/Templates/template.html"),
        SingleCategoryView = require("modules/menu/table/categories/singleCategoryView"),
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
            this.collection = Radio.request("ModelList", "getCollection");
            this.listenTo(Radio.channel("TableMenu"), {
                "hideMenuElementCategory": this.hideMenu
            });
            this.listenTo(this.collection, {
                "updateLightTree": function () {
                    this.render();
                }
            });
            // Aktiviert ausgewälter Layer; Layermenu ist aktiv
            this.listenTo(this.collection, {
                "updateSelection": function () {
                    this.render();
                    $(".table-nav-cat-panel").collapse("show");
                    this.$el.addClass("categoryMenuIsActive");
                }
            });
            // bootstrap collapse event
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
            this.renderList();
            return this.$el;
        },
        renderList: function () {
            var models = this.collection.where({type: "categories"});

            models = _.sortBy(models, function (model) {
                return model.getSelectionIDX();
            });
            this.addViews(models);
        },

        addViews: function (models) {
            var childElement = {};

            _.each(models, function (model) {
                childElement = new SingleCategoryView({model: model}).render();
                this.$el.find("ul.categories").prepend(childElement);

            }, this);
        }
    });

    return CategoryView;
});