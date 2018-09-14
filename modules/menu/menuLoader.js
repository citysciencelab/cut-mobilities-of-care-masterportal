import LightMenu from "./desktop/listViewLight";
import Menu from "./desktop/listView";
import MobileMenu from "./mobile/listView";

function MenuLoader () {
    var channel = Radio.channel("MenuLoader");

    this.treeType = Radio.request("Parser", "getTreeType");

    /**
     * Prüft initial und nach jedem Resize, ob und welches Menü geladen werden muss und lädt bzw. entfernt Module.
     * @param  {Object} caller this MenuLoader
     * @return {Object}        this
     */
    this.loadMenu = function (caller) {
        var isMobile = Radio.request("Util", "isViewMobile");

        if (!this.menuStyle) {
            this.menuStyle = Radio.request("Util", "getUiStyle");
        }

        if (this.menuStyle === "TABLE") {
            caller.currentMenu = new Menu();
            channel.trigger("ready", caller.currentMenu.id);
        }
        else if (this.menuStyle === "DEFAULT") {
            $("#map").css("height", "calc(100% - 50px)");
            $("#main-nav").show();

            if (isMobile) {
                caller.currentMenu = new MobileMenu();
            }
            else if (this.treeType === "light") {
                caller.currentMenu = new LightMenu();
                channel.trigger("ready");
                Radio.trigger("Map", "updateSize");
            }
            else {
                caller.currentMenu = new Menu();
                channel.trigger("ready");
                Radio.trigger("Map", "updateSize");
            }
            // Nachdem die MapSize geändert wurde, muss die Map aktualisiert werden.
            Radio.trigger("Map", "updateSize");
        }
    };
    this.currentMenu = this.loadMenu(this);
    // im Table-Style soll das ui nicht verändert werden
    if (this.menuStyle === "DEFAULT") {
        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.currentMenu.removeView();
                this.currentMenu = this.loadMenu(this);
            }
        }, this);
    }
}

export default MenuLoader;
