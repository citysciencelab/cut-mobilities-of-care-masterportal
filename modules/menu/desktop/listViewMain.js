define([
    "backbone",
    "modules/menu/desktop/tool/view",
    "modules/menu/desktop/folder/viewMenu",
      "bootstrap/dropdown",
    "bootstrap/collapse"
    ],
    function () {
        var Backbone = require("backbone"),
            DesktopToolView = require("modules/menu/desktop/tool/view"),
            DesktopFolderView = require("modules/menu/desktop/folder/viewMenu"),
            Menu;

        Menu = Backbone.View.extend({
            collection: {},
            el: "nav#main-nav",
            attributes: {
                role: "navigation"
            },
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
                this.autostartTool();
            },
            /**
            * Startet alle Tools aus config.json mit "autostart:true"
            */
            autostartTool: function () {
                _.each(this.collection.where({type: "tool"} && {autostart: true}), function (model) {
                    model.setIsActive(true);
                });
            },
            addFolderViews: function (models) {
                _.each(models, function (model) {
                    new DesktopFolderView({model: model});
                }, this);
            },
            addToolViews: function (models) {
                _.each(models, function (model) {
                    new DesktopToolView({model: model});
                }, this);
            },
            removeView: function () {
                this.$el.find("ul.nav-menu").html("");

                // remove entfernt alle Listener und das Dom-Element
                this.remove();
                this.collection.setAllModelsInvisible();
                // Das Dom-Element wird für den mobile-View beim wechsel benötigt
                // deswegen wieder anhängen.
                $("body").append(this.el);
            }
        });
        return Menu;
    }
);
