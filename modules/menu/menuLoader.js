define(function (require) {
    var MenuLoader,
        $ = require("jquery");

    MenuLoader = function () {
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
                else if (this.treeType === "light") {
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
    };

    return MenuLoader;
});
