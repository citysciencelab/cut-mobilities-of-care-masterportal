define(
    [
        "backbone.radio",
        "modules/menu/desktop/listViewLight",
        "modules/menu/desktop/listViewComplex",
        "modules/menu/mobile/listView"
    ], function () {
        var Radio = require("backbone.radio"),
            MenuLoader;

        MenuLoader =  function () {
            this.treeType = Radio.request("Parser", "getTreeType");
            this.loadMenu();
        },
        MenuLoader.prototype = {
            loadMenu: function () {
                var isMobile = Radio.request("Util", "isViewMobile");

                if (isMobile) {
                    require(["modules/menu/mobile/listView"], function (Menu) {
                        new Menu();
                    });
                }
                else {
                    if (this.treeType === "light") {
                        require(["modules/menu/desktop/listViewLight"], function (Menu) {
                        new Menu();
                    });
                    }
                    else {
                        require(["modules/menu/desktop/listViewComplex"], function (Menu) {
                        new Menu();
                    });
                    }
                }
            }
        };
        return MenuLoader;
    });
