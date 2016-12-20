define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        View = require("modules/gfipopup/popup/view"),
        ViewMobile = require("modules/gfipopup/popup/viewMobile"),
        Util = require("modules/core/util"),
        GFIPopupLoader;

    GFIPopupLoader = Backbone.Model.extend({
        defaults: {
            currentView: {}
        },
    initialize: function () {
        Radio.on("Util", {
            "isViewMobileChanged": this.checkIfMobile
        }, this);

        var isMobile = Radio.request("Util", "isViewMobile"),
            context = this;

        if (isMobile) {
            require(["modules/gfipopup/popup/viewMobile"], function (GFIPopupView) {
                context.set("currentView", new GFIPopupView());
            });
        }
        else {
             require(["modules/gfipopup/popup/view"], function (GFIPopupView) {
                 context.set("currentView", new GFIPopupView());
            });
        }
    },
    checkIfMobile: function () {
        var isMobile = Radio.request("Util", "isViewMobile"),
            context = this,
            gfiWin = $(".gfi-win").is(":visible"),
            gfiModal = $(".gfi-mobile-header").is(":visible");

        this.get("currentView").remove();
        if (isMobile) {
            require(["modules/gfipopup/popup/viewMobile"], function (GFIPopupView) {
                 context.set("currentView", new GFIPopupView());
                 if (gfiWin === true) {
                     context.get("currentView").render();
                     Radio.trigger("MapMarker", "hideMarker");
                     }
            });
        }
        else {
            $(".modal-backdrop").remove();
             require(["modules/gfipopup/popup/view"], function (GFIPopupView) {
                  context.set("currentView", new GFIPopupView());
                  if (gfiModal === true) {
                      context.get("currentView").render();
                      Radio.trigger("MapMarker", "showMarker", Radio.request("GFIPopup", "getCoordinates"));
                      }

            });
        }
    }

    });

    return GFIPopupLoader;
});
