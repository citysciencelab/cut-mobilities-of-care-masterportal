import LightMenu from "./desktop/listViewLight";
import Menu from "./desktop/listView";
import MobileMenu from "./mobile/listView";
import TableMenu from "./table/view";

const MenuLoader = Backbone.Model.extend(/** @lends MenuLoader.prototype */{
    defaults: {
        treeType: "light",
        currentMenu: ""
    },
    /**
     * @class MenuLoader
     * @extends Backbone.Model
     * @memberof Menu
     * @constructs
     * @description This Loader gives you ...
     */
    initialize: function () {
        this.treeType = Radio.request("Parser", "getTreeType");

        this.loadMenu();

        // im Table-Style soll das ui nicht verändert werden
        if (this.menuStyle === "DEFAULT") {
            Radio.on("Util", {
                "isViewMobileChanged": function () {
                    $("div.collapse.navbar-collapse ul.nav-menu").empty();
                    $("div.collapse.navbar-collapse .breadcrumb-mobile").empty();
                    this.loadMenu();
                }
            }, this);
        }
    },
    /**
     * Prüft initial und nach jedem Resize, ob und welches Menü geladen werden muss und lädt bzw. entfernt Module.
     * @param  {Object} caller this MenuLoader
     * @return {Object}        this
     * @fires Map#RadioTriggerMapUpdateSize
     */
    loadMenu: function () {
        var isMobile = Radio.request("Util", "isViewMobile"),
            channel = Radio.channel("Menuloader");

        if (this.currentMenu) {
            this.currentMenu.stopListening();
        }
        if (!this.menuStyle) {
            this.menuStyle = Radio.request("Util", "getUiStyle");
        }

        if (this.menuStyle === "TABLE") {
            this.currentMenu = new TableMenu();
            channel.trigger("ready", this.currentMenu.id);
        }
        else if (this.menuStyle === "DEFAULT") {
            $("#map").css("height", "calc(100% - 50px)");
            $("#main-nav").show();

            if (isMobile) {
                this.currentMenu = new MobileMenu();
            }
            else if (this.treeType === "light") {
                this.currentMenu = new LightMenu();
            }
            else {
                this.currentMenu = new Menu();
            }
            // Nachdem die MapSize geändert wurde, muss die Map aktualisiert werden.
            channel.trigger("ready", this.currentMenu.id);
            Radio.trigger("Map", "updateSize");
        }
    }
});

export default MenuLoader;
