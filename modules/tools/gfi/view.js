define(function (require) {

    var Backbone = require("backbone"),
        GFIView;

    GFIView = Backbone.View.extend({
        events: {
            "click .glyphicon-remove": "hideGFI",
            "click .pager-right": "renderNext",
            "click .pager-left": "renderPrevious"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:themeIndex": this.updatePager,
                // wird in den Subclasses aufgerufen
                "change:isVisible": this.toggle,
                // wird in gfi/desktop/detached/view.js aufgerufen
                "change:coordinate": this.setMarker
            });

            // Die attached View braucht für ol.Overlay noch ein Dom-Element
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
                var preWidth = $(".gfi-attached").width();

                this.model.set("themeIndex", this.model.get("themeIndex") + 1);
                this.replaceArrow(preWidth);
            }
        },

        /**
         *
         */
        renderPrevious: function () {
            if ($(".pager-left").hasClass("disabled") === false) {
                var preWidth = $(".gfi-attached").width();

                this.model.set("themeIndex", this.model.get("themeIndex") - 1);
                this.replaceArrow(preWidth);
            }
        },

        /**
         * Pager css wird angepasst
         * @param  {Backbone.Model} model - this
         * @param  {number} value - themeIndex
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
         * Ein bisschen jQuery-Magie, damit der Arrow von der detached View an der richtigen Stelle bleibt
         * @param  {number} preWidth - vorherige Breite der detached View
         */
        replaceArrow: function (preWidth) {
            $(".popover.bottom > .arrow").css({
                "margin-left": function (index, value) {
                    return parseFloat(value, 10) - (($(".gfi-attached").width() - preWidth) / 2);
                }
            });
        },

        /**
         * Ruft die Funktion setIsVisible im Model auf
         */
        hideGFI: function () {
            this.model.setIsVisible(false);
        }
    });

    return GFIView;
});
