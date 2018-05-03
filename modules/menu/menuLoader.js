define([
    "config",
    "backbone.radio",
    "modules/menu/desktop/listViewLight",
    "modules/menu/desktop/listView",
    "modules/menu/mobile/listView",
    "modules/menu/table/view"
], function (Config) {
    var Radio = require("backbone.radio"),
        MenuLoader;

    MenuLoader = function () {
        var channel = Radio.channel("MenuLoader");

        this.treeType = Radio.request("Parser", "getTreeType");

        this.loadMenu = function (caller) {
            var isMobile = Radio.request("Util", "isViewMobile");

            if (!this.menuStyle) {
                this.menuStyle = Radio.request("Util", "getUiStyle");
            }

            if (this.menuStyle === "TABLE") {
                require(["modules/menu/table/view"], function (Menu) {
                    caller.currentMenu = new Menu();
                    channel.trigger("ready", caller.currentMenu.id);
                });
            }
            else if (this.menuStyle === "DEFAULT") {
                    $("#map").css("height", "calc(100% - 50px)");
                    $("#main-nav").show();

                if (isMobile) {
                    require(["modules/menu/mobile/listView"], function (Menu) {
                        caller.currentMenu = new Menu();
                        channel.trigger("ready");
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
            }
        };
        this.currentMenu = this.loadMenu(this);
        Radio.on("Util", {
            "isViewMobileChanged": function () {
                if (this.menuStyle === "DEFAULT") {
                    this.currentMenu.removeView();
                    this.currentMenu = this.loadMenu(this);
                }
            }
        }, this);
    };

    return MenuLoader;
});
