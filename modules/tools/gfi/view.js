const GFIView = Backbone.View.extend({
    events: {
        "click .glyphicon-remove": "hideGFI",
        "click .pager-right": "renderNext",
        "click .pager-left": "renderPrevious",
        "mouseenter": "hideMouseHover"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:themeIndex": this.updatePager,
            // wird in den Subclasses aufgerufen
            "change:isVisible": this.toggle,
            // wird in gfi/desktop/detached/view.js aufgerufen
            "change:coordinate": this.setMarker
        });

        $(window).resize($.proxy(function () {
            $(".gfi").css({
                "max-height": window.innerHeight - 100 // 100 fixer Wert für navbar &co.
            });
        }, this));

        $(window).resize($.proxy(function () {
            $(".gfi-content").css({
                "max-height": window.innerHeight - 100 - 34 - 43 // 100 fixer Wert für navbar &co. 34 für header vom gfi 43 für den footer beim gfi
            });
        }, this));

        // Die attached View braucht für ol.Overlay noch ein Dom-Element
        if (this.model.get("desktopViewType") === "attached" && Radio.request("Util", "isViewMobile") === false) {
            this.renderDomElementToBody();
            this.model.setOverlayElement(document.getElementById("gfipopup"));
        }
    },

    renderNext: function () {
        var preWidth = 0;

        if (this.$(".pager-right").hasClass("disabled") === false) {
            preWidth = this.$(".gfi-attached").width();

            this.model.set("themeIndex", this.model.get("themeIndex") + 1);
            this.replaceArrow(preWidth);
        }
    },
    /**
    * hides mousehover if mouse enters gfi
    * necessary in case that gfi is open and mousehover overlays gfi
    * @returns {void}
    */
    hideMouseHover: function () {
        Radio.trigger("MouseHover", "hide");
    },
    renderPrevious: function () {
        var preWidth = 0;

        if (this.$(".pager-left").hasClass("disabled") === false) {
            preWidth = this.$(".gfi-attached").width();
            this.model.set("themeIndex", this.model.get("themeIndex") - 1);
            this.replaceArrow(preWidth);
        }
    },

    /**
     * Pager css wird angepasst
     * @param  {Backbone.Model} model - this
     * @param  {number} value - themeIndex
     * @returns {void}
     */
    updatePager: function (model, value) {
        if (value === 0) {
            this.$(".pager-left").addClass("disabled");
        }
        else {
            this.$(".pager-left").removeClass("disabled");
        }
        if (value === this.model.get("numberOfThemes") - 1) {
            this.$(".pager-right").addClass("disabled");
        }
        else {
            this.$(".pager-right").removeClass("disabled");
        }
    },

    /**
     * Ein bisschen jQuery-Magie, damit der Arrow von der detached View an der richtigen Stelle bleibt
     * @param  {number} preWidth - vorherige Breite der detached View
     * @returns {void}
     */
    replaceArrow: function (preWidth) {
        this.$(".popover.bottom > .arrow").css({
            "margin-left": function (index, value) {
                return parseFloat(value, 10) - ((this.$(".gfi-attached").width() - preWidth) / 2);
            }
        });
    },

    /**
     * Ruft die Funktion setIsVisible im Model auf
     * @returns {void}
     */
    hideGFI: function () {
        this.model.setIsVisible(false);
    }
});

export default GFIView;
