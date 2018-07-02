define([
    "backbone",
    "modules/menu/desktop/tool/view",
    "modules/menu/desktop/folder/viewMenu",
    "modules/menu/desktop/folder/viewCatalog",
    "modules/menu/desktop/staticlink/view",
    "bootstrap/dropdown",
    "bootstrap/collapse"
],
function () {
    var Backbone = require("backbone"),
        DesktopToolView = require("modules/menu/desktop/tool/view"),
        DesktopFolderView = require("modules/menu/desktop/folder/viewMenu"),
        CatalogFolderView = require("modules/menu/desktop/folder/viewCatalog"),
        DesktopStaticLinkView = require("modules/menu/desktop/staticlink/view"),
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
            $("div.collapse.navbar-collapse").removeClass("in");

            this.renderTopMenu();
        },
        renderTopMenu: function () {
            var models = _.filter(this.collection.models, function (model) {
                return model.getType() === "tool" || model.getType() === "staticlink" || model.getType() === "folder";
            });

            this.parseViews(models);
        },
        parseViews: function (models) {
            _.each(models, function (model) {
                switch (model.getType()) {
                    case "tool": {
                        this.addToolView(model);
                        break;
                    }
                    case "staticlink": {
                        this.addStaticLinkView(model);
                        break;
                    }
                    case "folder": {
                        // Oberste ebene im Themenbaum?
                        if (model.getParentId() === "tree") {
                            this.addCatalogFolderView(model);
                        }
                        else {
                            this.addDesktopFolderView(model);
                        }
                        break;
                    }
                }
            }, this);
        },
        addCatalogFolderView: function (model) {
            new CatalogFolderView({model: model});
        },
        addDesktopFolderView: function (model) {
            new DesktopFolderView({model: model});
        },
        addToolView: function (model) {
            new DesktopToolView({model: model});
        },
        addStaticLinkView: function (model) {
            new DesktopStaticLinkView({model: model});
        },
        removeView: function () {
            this.$el.find("ul.nav-menu").html("");

            // remove entfernt alle Listener und das Dom-Element
            this.remove();
            this.collection.setAllModelsInvisible();
            // Das Dom-Element wird für den mobile-View beim wechsel benötigt
            // deswegen wieder anhängen.
            $("#map").before(this.el);
        }
    });
    return Menu;
});
