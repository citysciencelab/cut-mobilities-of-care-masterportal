define([
    "backbone",
    "modules/menu/desktop/tool/view",
    "modules/menu/desktop/folder/view",
      "bootstrap/dropdown",
    "bootstrap/collapse"
    ],
    function () {
        var Backbone = require("backbone"),
            DesktopToolView = require("modules/menu/desktop/tool/view"),
            DesktopFolderView = require("modules/menu/desktop/folder/view"),
            Menu;

        Menu = Backbone.View.extend({
            collection: {},
            el: "nav#main-nav",
            attributes: {
                role: "navigation"
            },
            subviews : [],
            renderMain: function () {
                $("div.collapse.navbar-collapse ul.nav-menu").addClass("nav navbar-nav desktop");
                $("div.collapse.navbar-collapse ul.nav-menu").removeClass("list-group mobile");

                this.renderTopMenu();
            },
            renderTopMenu: function () {
                var rootModels = this.collection.where({parentId: "root"}),
                    folder = _.filter(rootModels, function (model) {
                        return model.getType() === "folder";
                    });

                this.addFolderViews(folder);

                this.addToolViews(this.collection.where({type: "tool"}));
            },
            addFolderViews: function (models) {
                _.each(models, function (model) {
                    this.subviews.push(new DesktopFolderView({model: model}));
                }, this);
            },
            addToolViews: function (models) {
                _.each(models, function (model) {
                    this.subviews.push(new DesktopToolView({model: model}));
                }, this);
            },
            removeView: function () {
                this.$el.find("ul.nav-menu").html("");

                this.collection.setAllAncestersInvisible("Themen");

                while (this.subviews.length) {
                    this.subviews.pop().remove();
                }
                // remove entfernt alle Listener und das Dom-Element
                this.remove();
                // Das Dom-Element wird für den mobile-View beim wechsel benötigt
                // deswegen wieder anhängen.
                $("body").append(this.el);
            }
        });
        return Menu;
    }
);
