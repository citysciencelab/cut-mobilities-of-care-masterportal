import SidebarModel from "./model";
import Template from "text-loader!./template.html";

const SidebarView = Backbone.View.extend(/** @lends SidebarView.prototype */{
    events: {
        "mousedown .drag-bar": "dragStart",
        "touchstart .drag-bar": "dragStart"
    },

    /**
     * @class SidebarView
     * @extends Backbone.View
     * @memberof Sidebar
     * @constructs
     * @fires Map#RadioTriggerMapUpdateSize
     * @listens Sidebar#changeIsVisible
     * @listens Sidebar#changeIsMobile
     * @listens Sidebar#addContent
     * @listens Sidebar#setWidth
     */
    initialize: function () {
        this.model = new SidebarModel();
        this.$el.addClass(this.getClassName());

        this.listenTo(this.model, {
            "change:isVisible": this.toggle,
            "change:isMobile": this.toggleClass,
            "change:width": this.setWidth,
            "addContent": this.addContent,
            "resize": function () {
                this.toggle(this.model);
            }
        });

        this.addEventListeners();

        $("#map").after(this.$el);
    },
    template: _.template(Template),
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
     * adds the eventListeners to the window Object
     * responsible for handling the drag Events on Keyboard and Touch
     * @returns {void}
     */
    addEventListeners: function () {
        window.addEventListener("mouseup", () => {
            this.dragEnd();
        });
        window.addEventListener("mousemove", (event) => {
            this.dragMove(event);
        });
        window.addEventListener("touchend", () => {
            this.dragEnd();
        });
        window.addEventListener("touchmove", (event) => {
            this.dragMove(event);
        });
    },

    /**
     * Add HTML content to this sidebar
     * @param {HTML} element Element from a tool view
     * @param {boolean} dragable is the sidebar resizeable?
     * @returns {void}
     */
    addContent: function (element, dragable) {
        this.$el.html(this.template({dragable}));
        this.$el.find("#sidebar-content").html(element);
    },

    /**
     * Sets the width.
     * @param {Backbone.Model} model - The sidebar model.
     * @param {String} width Width
     * @returns {void}
     */
    setWidth: function (model, width) {
        this.$el.css("width", width);
    },
    /**
     * Shows or hides this view.
     * @param {SidebarModel} model The sidebar model.
     * @param {boolean} isVisible Flag if sidebar is visible.
     * @return {void}
     * @fires Map#RadioTriggerMapUpdateSize
     */
    toggle: function (model) {
        if (this.model.get("isVisible")) {
            this.$el.css("width", this.model.get("width"));
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
        this.setMapWidth(this.model.get("isMobile"), this.model.get("isVisible"), model.get("width"));
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
        this.setMapWidth(isMobile, this.model.get("isVisible"));
    },
    /**
     * Sets the width of the map
     * @param {boolean} isMobile Flag if the portal is in mobile mode.
     * @param {boolean} isVisible Flag if the sidebar is visible.
     * @param {String} width The width of the sidebar in percent. e.g. "30%"
     * @return {void}
     */
    setMapWidth: function (isMobile, isVisible, width = "100%") {
        if (!isMobile && isVisible) {
            const diffToHundred = 100 - parseFloat(width.substring(0, width.length - 1));

            $("#map").css("width", diffToHundred + "%");
            $(".elements-positioned-over-map").css("width", diffToHundred + "%");
        }
        else {
            $("#map").css("width", "100%");
            $(".elements-positioned-over-map").css("width", "100%");
        }
    },

    /**
     * handles the drag Start event to resize the sidebar
     * @param {*} event the DOM-event
     * @returns {void}
     */
    dragStart: function (event) {
        event.preventDefault();
        this.isDragging = true;
        this.$el.find(".drag-bar").addClass("dragging");
    },

    /**
     * handles the drag move event to resize the sidebar
     * @param {*} event the DOM-event
     * @fires Sidebar#RadioTriggerResize
     * @returns {void}
     */
    dragMove: function (event) {
        if (this.isDragging) {
            const eventX = event.type === "touchmove" ? event.touches[0].clientX : event.clientX,
                newWidth = (((window.innerWidth - eventX) / window.innerWidth) * 100).toFixed(2) + "%";

            // Radio.trigger("Sidebar", "resize", newWidth);
            this.model.resize(newWidth);
        }
    },

    /**
     * handles the drag End event to resize the sidebar
     * @param {*} event the DOM-event
     * @returns {void}
     */
    dragEnd: function () {
        this.isDragging = false;
        this.$el.find(".drag-bar").removeClass("dragging");
    }
});

export default SidebarView;
