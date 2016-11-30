define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        View = require("modules/gfipopup/popup/view"),
        ViewMobile = require("modules/gfipopup/popup/viewMobile"),
        Util = require("modules/core/util"),
        GFIPopupLoader;

    GFIPopupLoader = Backbone.Model.extend({
        defaults :{
            currentView: {}
        },
    initialize: function () {
        Radio.on("Util", {
            "isViewMobileChanged": "checkIfMobile"
        }, this);

        var isMobile = Radio.request("Util", "isViewMobile"),
            context = this;

        if (isMobile) {
            require(["modules/gfipopup/popup/viewMobile"], function (GFIPopupView) {
                context.set("currenView", new GFIPopupView());
            });
        }
        else {
             require(["modules/gfipopup/popup/view"], function (GFIPopupView) {
                 context.set("currenView", new GFIPopupView());
            });
        }
    },
    checkIfMobile: function () {
        var isMobile = Radio.request("Util", "isViewMobile"),
            context = this;

        this.get("currentView").remove();
        if (isMobile) {
            require(["modules/gfipopup/popup/viewMobile"], function (GFIPopupView) {
                 context.set("currenView", new GFIPopupView());
            });
        }
        else {
             require(["modules/gfipopup/popup/view"], function (GFIPopupView) {
                  context.set("currenView", new GFIPopupView());
            });
        }
    }

    });

    return GFIPopupLoader;
});
