define([
    "backbone",
    "backbone.radio",
    "modules/menu/desktop/tool/view",
    "modules/menu/desktop/folder/view",
      "bootstrap/dropdown",
    "bootstrap/collapse"
    ],
    function () {
        var Backbone = require("backbone"),
            Radio = require("backbone.radio"),
            DesktopToolView = require("modules/menu/desktop/tool/view"),
            DesktopFolderView = require("modules/menu/desktop/folder/view"),
            Menu;

        Menu = Backbone.View.extend({
            collection: {},
            el: "nav#main-nav",
            attributes: {role: "navigation"},
            initialize: function () {
                this.collection = Radio.request("ModelList", "getCollection");
                Menu.prototype.render.call(this);
            },
            render: function () {
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
                    new DesktopFolderView({model: model});
                });
            },
            addToolViews: function (models) {
                _.each(models, function (model) {
                    new DesktopToolView({model: model});
                });
            }
        });
        return Menu;
    }
);
