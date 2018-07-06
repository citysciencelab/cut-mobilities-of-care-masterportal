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

            if (this.getStyle() === "TABLE") {
                new FreezeToolMenuView({model: this});
            }
            else {
                new FreezeControlMenuView({model: this, el: this.getElement()});
            }
        },

        setStyle: function (val) {
            this.set("uiStyle", val);
        },

        getStyle: function () {
            return this.get("uiStyle");
        },

        setView: function (val) {
            this.set("view", val);
        },

        getView: function () {
            return this.get("view");
        },

        setElement: function (val) {
            this.set("el", val);
        },

        getElement: function () {
            return this.get("el");
        },

        startFreezeWin: function () {
            this.getView().showFreezeWin();
        }
    });

    return FreezeModel;
});
