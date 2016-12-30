define(function (require) {

    var Backbone = require("backbone"),
        GFIDesktopView;

    GFIDesktopView = Backbone.View.extend({
        events: {
            "click .glyphicon-remove": "hide",
            "click .pager-right": "renderNext",
            "click .pager-left": "renderPrevious"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:currentCount": this.updatePager,
                "change:isVisible": this.toggle,
                "change:coordinate": this.setMarker
            });

            if (this.model.getDesktopViewType() === "attached" && this.model.getIsMobile() === false) {
                this.renderDomElementToBody();
                this.model.setOverlayElement(document.getElementById("gfipopup"));
            }
        },

        /**
         *
         */
        renderNext: function () {
            if ($(".pager-right").hasClass("disabled") === false) {
                this.model.set("currentCount", this.model.get("currentCount") + 1);
            }
        },

        /**
         *
         */
        renderPrevious: function () {
            if ($(".pager-left").hasClass("disabled") === false) {
                this.model.set("currentCount", this.model.get("currentCount") - 1);
            }
        },

        /**
         * [updatePager description]
         * @param  {[type]} model [description]
         * @param  {[type]} value [description]
         */
        updatePager: function (model, value) {
            if (value === 0) {
                $(".pager-left").addClass("disabled");
            }
            else {
                $(".pager-left").removeClass("disabled");
            }
            if (value === this.model.get("numberOfThemes") - 1) {
                $(".pager-right").addClass("disabled");
            }
            else {
                $(".pager-right").removeClass("disabled");
            }
        },

        /**
         * Ruft die Funktion setIsVisible im Model auf
         */
        hide: function () {
            this.model.setIsVisible(false);
            // this.model.getThemeList().at(this.model.get(""))
        }
    });

    return GFIDesktopView;
});
