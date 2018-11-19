import DesktopToolView from "./tool/view";
import DesktopFolderView from "./folder/viewMenu";
import CatalogFolderView from "./folder/viewCatalog";
import DesktopStaticLinkView from "./staticlink/view";
import DesktopViewpointView from "./viewpoint/view";

import "bootstrap";

const Menu = Backbone.View.extend({
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
        var models = this.collection.filter(function (model) {
            return model.get("type") === "tool" || model.get("type") === "staticlink" || (model.get("parentId") === "root" && model.get("type") === "folder") || model.get("type") === "viewpoint";
        });

        this.parseViews(models);
    },
    parseViews: function (models) {
        _.each(models, function (model) {
            switch (model.get("type")) {
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
                    if (model.get("parentId") === "tree") {
                        this.addCatalogFolderView(model);
                    }
                    else {
                        this.addDesktopFolderView(model);
                    }
                    break;
                }
                case "viewpoint": {
                    this.addViewpointView(model);
                    break;
                }
                default: {
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
    addViewpointView: function (model) {
        new DesktopViewpointView({model: model});
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

export default Menu;
