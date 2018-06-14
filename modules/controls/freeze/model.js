define([
    "backbone",
    "backbone.radio",
    "modules/controls/freeze/freezewindowview",
    "modules/controls/freeze/freezetoolmenuview",
    "modules/controls/freeze/freezecontrolmenuview"
], function (Backbone, Radio, FreezeView, FreezeToolMenuView, FreezeControlMenuView) {

    var FreezeModel = Backbone.Model.extend({

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
