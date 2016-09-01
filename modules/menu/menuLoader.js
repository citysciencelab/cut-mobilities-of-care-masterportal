define([
    "backbone.radio",
    "modules/menu/desktop/listViewLight",
    "modules/menu/desktop/listView",
    "modules/menu/mobile/listView"
], function () {
    var Radio = require("backbone.radio"),
        MenuLoader;

    MenuLoader = function () {
        var channel = Radio.channel("MenuLoader");

        this.treeType = Radio.request("Parser", "getTreeType");
        this.loadMenu = function (caller) {
            var isMobile = Radio.request("Util", "isViewMobile");

            if (isMobile) {
                require(["modules/menu/mobile/listView"], function (Menu) {
                    caller.currentMenu = new Menu();
                });
            }
            else {
                if (this.treeType === "light") {
                    require(["modules/menu/desktop/listViewLight"], function (Menu) {
                        caller.currentMenu = new Menu();
                        channel.trigger("ready");
                    });
                }
                else {
                    require(["modules/menu/desktop/listView"], function (Menu) {
                        caller.currentMenu = new Menu();
                        channel.trigger("ready");
                    });
                }
            }
        };
        this.currentMenu = this.loadMenu(this);
        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.currentMenu.removeView();

                this.currentMenu = this.loadMenu(this);
            }
        }, this);
    };
    return MenuLoader;
});
