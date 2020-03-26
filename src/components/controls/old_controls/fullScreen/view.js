import FullScreenTemplate from "text-loader!./template.html";
import FullScreenTemplateTable from "text-loader!./templateTable.html";
import FullScreenControlModel from "./model";

/**
 * @member FullScreenTemplate
 * @description template used for UiStyle DEFAULT
 * @memberof Controls.FullScreen
 */
/**
 * @member FullScreenTemplateTable
 * @description template used for UiStyle TABLE
 * @memberof Controls.FullScreen
 */

const FullScreenControlView = Backbone.View.extend(/** @lends FullScreenControlView.prototype */{
    events: {
        "click .full-screen-button": "toggleFullscreen",
        "click div#full-screen-view": "toggleFullscreen"
    },

    /**
     * @class FullScreenControlView
     * @extends Backbone.View
     * @memberof Controls.FullScreen
     * @constructs
     * @description this control button switches the browser from normal screen to fullscreen and back - or for iframes: opens the iframe url in a _blank
     * @fires Core#RadioRequestUtilGetUiStyle
     * @listens Controls.FullScreen#changeEnableText
     * @listens Controls.FullScreen#changeDisableText
     * @listens Controls.FullScreen#changeToggleText
     * @listens Controls.FullScreen#changeState
     */
    initialize: function () {
        const style = Radio.request("Util", "getUiStyle");

        this.model = new FullScreenControlModel();
        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;

                if (changed.enableText || changed.disableText || changed.toggleText || changed.hasOwnProperty("state")) {
                    if (style === "DEFAULT") {
                        this.render();
                    }
                    else if (style === "TABLE") {
                        this.renderToToolbar();
                    }
                }
            }
        });

        if (style === "DEFAULT") {
            this.render();
        }
        else if (style === "TABLE") {
            this.renderToToolbarInit();
        }
    },

    id: "full-screen-button",

    /**
     * render function for the default UiStyle
     * @pre the bound element $e is something or nothing
     * @post the default template is attached to $el
     * @returns {this}  -
     */
    render: function () {
        const attr = this.model.toJSON(),
            template = _.template(FullScreenTemplate);

        this.$el.html(template(attr));

        return this;
    },

    /**
     * initial render function for the table UiStyle - this is necessary because $el has classes attached that are styled for red buttons (which are not used in table style)
     * @pre the bound element $e is in its initial state (with some css classes)
     * @post the table template is attached to $el, $el has been striped from its css classes and $el is append to the list #table-tools-menu
     * @returns {Void}  -
     */
    renderToToolbarInit: function () {
        this.renderToToolbar();

        // remove all css classes of main element because this is not a red button
        this.$el.attr("class", "");
        $("#table-tools-menu").append(this.$el);
    },

    /**
     * render function for the table UiStyle
     * @pre the bound element $e is something
     * @post the table template is attached to $el
     * @returns {Void}  -
     */
    renderToToolbar: function () {
        const attr = this.model.toJSON(),
            templateTable = _.template(FullScreenTemplateTable);

        this.$el.html(templateTable(attr));
    },

    /**
     * toggles between fullscreen and normal screen, sets the state of the model true/false
     * @pre the fullscreen mode is something
     * @post the screen mode was detected (independent of the model state), the screen has been switched and the model state has been brought in line
     * @fires Controls.FullScreen#changeState
     * @return {Void}  -
     */
    toggleFullscreen: function () {
        if (window.self === window.top) {
            // if the page is not held in an iframe

            if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                if (this.openFullscreen()) {
                    this.model.set("state", true);
                }
            }
            else if (this.closeFullscreen()) {
                this.model.set("state", false);
            }
        }
        else {
            // the page is held in an iframe and can't be set to fullscreen - so a new tab is opened for better access
            window.open(window.location.href, "_blank");
        }
    },

    /**
     * enables fullscreen using browser tools
     * @returns {Boolean}  if true: fullscreen has been enabled, if false: unable to enable fullscreen
     */
    openFullscreen: function () {
        const elem = document.documentElement;

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
            return true;
        }
        else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
            return true;
        }
        else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
            return true;
        }
        else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            return true;
        }

        return false;
    },

    /**
     * disables fullscreen using browser tools if fullscreen was enabled before using the same browser tools
     * @returns {Boolean}  if true: fullscreen has been disabled, if false: unable to disable fullscreen
     */
    closeFullscreen: function () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            return true;
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
            return true;
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
            return true;
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
            return true;
        }

        return false;
    }
});

export default FullScreenControlView;
