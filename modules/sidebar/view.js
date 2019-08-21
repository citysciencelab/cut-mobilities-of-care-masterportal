import SidebarModel from "./model";

const SidebarView = Backbone.View.extend(/** @lends SidebarView.prototype */{
    /**
     * @class SidebarView
     * @extends Backbone.View
     * @memberof Sidebar
     * @constructs
     * @fires Map#RadioTriggerMapUpdateSize
     * @listens Sidebar#changeIsVisible
     * @listens Sidebar#changeIsMobile
     * @listens Sidebar#addContent
     */
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
     * Creates the class name.
     * @returns {string} ClassName
     */
    getClassName: function () {
        if (this.model.get("isMobile")) {
            return "sidebar-mobile";
        }
        return "sidebar";
    },
    /**
     * Add HTML content to this sidebar
     * @param {HTML} element Element from a tool view
     * @returns {void}
     */
    addContent: function (element) {
        this.$el.html(element);
    },

    /**
     * Shows or hides this view.
     * @param {SidebarModel} model The sidebar model.
     * @param {boolean} isVisible Flag if sidebar is visible.
     * @return {void}
     * @fires Map#RadioTriggerMapUpdateSize
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
     * Toggles the css class for this view
     * @param {SidebarModel} model The sidebar model.
     * @param {boolean} isMobile Flag if the portal is in mobile mode.
     * @return {void}
     */
    toggleClass: function (model, isMobile) {
        this.$el.toggleClass("sidebar sidebar-mobile");
        this.toggleBackdrop(isMobile, this.model.get("isVisible"));
        this.setMapWidth(isMobile, this.model.get("isVisible"));
    },

    /**
     * Sets the width of the map
     * @param {boolean} isMobile Flag if the portal is in mobile mode.
     * @param {boolean} isVisible Flag if the sidebar is visible.
     * @return {void}
     */
    setMapWidth: function (isMobile, isVisible) {
        const $map = $("#map"),
            $sidebar = $(".sidebar"),
            parentWidth = $map.parent().width(),
            relativeWidth = Math.floor((parentWidth - $sidebar.width()) / parentWidth * 100);

        if (!isMobile && isVisible) {
            $map.css("width", relativeWidth + "%");
        }
        else {
            $map.css("width", "100%");
        }
    },

    /**
     * Toggles the backdrop. Needed for the mobile mode
     * @param {boolean} isMobile Flag if the portal is in mobile mode.
     * @param {boolean} isVisible Flag if the sidebar is visible.
     * @return {void}
     */
    toggleBackdrop: function (isMobile, isVisible) {
        if (isMobile && isVisible) {
            $(".masterportal-container").append("<div class='backdrop'></div>");
        }
        else {
            $(".backdrop").remove();
        }
    }
});

export default SidebarView;
