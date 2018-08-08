define(function (require) {
    var FreezeView = require("modules/controls/freeze/freezewindowview"),
        FreezeToolMenuView = require("modules/controls/freeze/freezetoolmenuview"),
        FreezeControlMenuView = require("modules/controls/freeze/freezecontrolmenuview"),
        FreezeModel;


    FreezeModel = Backbone.Model.extend({

        defaults: {

        },

        initialize: function () {
            this.setView(new FreezeView({model: this}));

            if (this.get("uiStyle") === "TABLE") {
                new FreezeToolMenuView({model: this});
            }
            else {
                new FreezeControlMenuView({model: this, el: this.get("el")});
            }
        },

        setStyle: function (val) {
            this.set("uiStyle", val);
        },

        setView: function (val) {
            this.set("view", val);
        },

        setElement: function (val) {
            this.set("el", val);
        },

        startFreezeWin: function () {
            this.get("view").showFreezeWin();
        }
    });

    return FreezeModel;
});
