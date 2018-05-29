define([
    "backbone",
    "backbone.radio",
    "modules/controls/freeze/freezewindowview",
    "modules/controls/freeze/freezetoolmenuview",
    "modules/controls/freeze/freezecontrolmenuview",
], function (Backbone, Radio, FreezeView, FreezeToolMenuView, FreezeControlMenuView) {

    var FreezeModel = Backbone.Model.extend({

        defaults: {
            visible: false
        },

        initialize: function (style) {
            var channel = Radio.channel("Freeze");

            this.setStyle(style);
            this.setView(new FreezeView({model:this}));

            if (style === "TABLE"){
                this.setMenuEntry(new FreezeToolMenuView({model: this}));
            }
            else {
              //  this.setMenuEntry(new FreezeControlMenuView({model: this}));
            }
        },

        setVisible: function (val) {
            this.set("visible", val);
        },

        getVisible: function () {
            return this.get("visible");
        },

        setStyle: function (val) {
            this.set("uiStyle", val);
        },

        getStyle: function (val) {
            return this.get("uiStyle");
        },

        setView: function (val) {
            this.set("view", val);
        },

        getView: function (val) {
            return this.get("view");
        },

        setMenuEntry: function (val) {
            this.set("menuEntry", val);
        },

        getMenuEntry: function (val) {
            return this.get("menuEntry");
        },

        startFreezeWin: function () {
            //this.getView().render();
            this.getView().showFreezeWin();
        }
    });

    return FreezeModel;
});
