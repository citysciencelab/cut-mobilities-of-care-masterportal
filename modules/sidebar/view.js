import SidebarModel from "./model";

const SidebarView = Backbone.View.extend({
    initialize: function () {
        this.model = new SidebarModel();
        this.$el.addClass(this.getClassName());

        this.listenTo(this.model, {
            "change:isVisible": this.toggle,
            "change:isMobile": this.toggleClass,
            "addContent": this.addContent
        });
        $("#map").after(this.$el);
    },

    /**
     * Ermittelt den ClassName dieser View
     * @returns {string}    ClassName
     */
    getClassName: function () {
        if (this.model.get("isMobile")) {
            return "sidebar-mobile";
        }
        return "sidebar";
    },
    /**
     * add HTML content to this sidebar
     * @param {DOM} element - from a tool view
     * @returns {void}
     */
    addContent: function (element) {
        this.$el.html(element);
    },

    /**
     * shows or hides this view
     * @param {Backbone.Model} model - this.model
     * @param {boolean} isVisible - is the sidebar visible
     * @return {void}
     */
    toggle: function (model, isVisible) {
        if (isVisible) {
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
        this.toggleBackdrop(this.model.get("isMobile"), isVisible);
        this.setMapWidth(this.model.get("isMobile"), isVisible);
        Radio.trigger("Map", "updateSize");
    },

    /**
     * toggles the css class for this view
     * @param {Backbone.Model} model - this.model
     * @param {boolean} isMobile -
     * @return {void}
     */
    toggleClass: function (model, isMobile) {
        this.$el.toggleClass("sidebar sidebar-mobile");
        this.toggleBackdrop(isMobile, this.model.get("isVisible"));
        this.setMapWidth(isMobile, this.model.get("isVisible"));
    },

    /**
     * sets the width of the map
     * @param {boolean} isMobile -
     * @param {boolean} isVisible - is the sidebar visible
     * @return {void}
     */
    setMapWidth: function (isMobile, isVisible) {
        if (!isMobile && isVisible) {
            $("#map").css("width", "70%");
        }
        else {
            $("#map").css("width", "100%");
        }
    },

    /**
     * toggles the backdrop
     * needed for the mobile mode
     * @param {boolean} isMobile -
     * @param {boolean} isVisible - is the sidebar visible
     * @return {void}
     */
    toggleBackdrop: function (isMobile, isVisible) {
        if (isMobile && isVisible) {
            $(".lgv-container").append("<div class='backdrop'></div>");
        }
        else {
            $(".backdrop").remove();
        }
    }
});

export default SidebarView;
