import LightMenu from "./desktop/listViewLight";
import Menu from "./desktop/listView";
import MobileMenu from "./mobile/listView";
import TableMenu from "./table/view";

const MenuLoader = Backbone.Model.extend({
    defaults: {
        treeType: "light",
        currentMenu: ""
    },
    initialize: function () {
        this.treeType = Radio.request("Parser", "getTreeType");

        this.loadMenu();

        // im Table-Style soll das ui nicht verändert werden
        if (this.menuStyle === "DEFAULT") {
            Radio.on("Util", {
                "isViewMobileChanged": function () {
                    this.currentMenu.removeView();
                    this.loadMenu();
                }
            }, this);
        }
    },
    /**
     * Prüft initial und nach jedem Resize, ob und welches Menü geladen werden muss und lädt bzw. entfernt Module.
     * @param  {Object} caller this MenuLoader
     * @return {Object}        this
     */
    loadMenu: function () {
        var isMobile = Radio.request("Util", "isViewMobile"),
            channel = Radio.channel("Menuloader");

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
                channel.trigger("ready");
                Radio.trigger("Map", "updateSize");
            }
            else {
                this.currentMenu = new Menu();
                channel.trigger("ready");
                Radio.trigger("Map", "updateSize");
            }
            // Nachdem die MapSize geändert wurde, muss die Map aktualisiert werden.
            Radio.trigger("Map", "updateSize");
        }
    }
});

export default MenuLoader;
