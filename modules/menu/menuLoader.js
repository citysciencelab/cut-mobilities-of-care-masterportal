define([
    "config",
    "backbone.radio",
    "modules/menu/desktop/listViewLight",
    "modules/menu/desktop/listView",
    "modules/menu/mobile/listView"
], function (Config) {
    var Radio = require("backbone.radio"),
        MenuLoader;

    MenuLoader = function () {
        var channel = Radio.channel("MenuLoader");

        this.treeType = Radio.request("Parser", "getTreeType");

        this.setMenuStyle = function () {
            var styleFromUrl = Radio.request("ParametricURL", "getStyle"),
                styleFromConf = Config.uiStyle ? Config.uiStyle.toUpperCase() : "",
                menuStyle = "DEFAULT";

            if (styleFromUrl && (styleFromUrl === "TABLE" || styleFromUrl === "SIMPLE")) {
                    menuStyle = styleFromUrl;
            }
            else if (styleFromConf === "TABLE" || styleFromConf === "SIMPLE") {
                menuStyle = styleFromConf;
            }
            return menuStyle;
        };

        this.loadMenu = function (caller) {
            var menuStyle = this.setMenuStyle(),
                isMobile = Radio.request("Util", "isViewMobile");

            if (menuStyle === "TABLE") {
                alert("is table!");
            }
            else if (menuStyle === "DEFAULT") {
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
                             Radio.trigger("Map", "updateSize");
                        });
                    }
                    else {
                        require(["modules/menu/desktop/listView"], function (Menu) {
                            caller.currentMenu = new Menu();
                            channel.trigger("ready");
                            Radio.trigger("Map", "updateSize");
                        });
                    }
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
