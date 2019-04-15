import MouseHoverPopup from "./model";

const MouseHoverPopupView = Backbone.View.extend(/** @lends MouseHoverPopupView.prototype */{
    /**
     * @class MouseHoverPopupView
     * @extends Backbone.View
     * @memberof MouseHover
     * @constructs
     * @classdesc Shows an ol.overlay with configured informations about the hovered feature on the map. It's always disabled on touch devices because they usually don't have a mouse to trigger a hover event.
     * @fires Util#RadioRequestUtilIsAny
     * @listens MouseHover#render
     * @listens MouseHover#destroy
     */
    initialize: function () {
        if (!this.isTouchdevice()) {
            this.model = new MouseHoverPopup();
            this.listenTo(this.model, {
                "render": this.render,
                "destroy": this.destroy
            });

            this.createOverlayElement();
        }
    },

    /**
     * Checks the device type. Disable the ability on smartphones and tablets as they usually don't have a mouse to hover.
     * @fires Util#RadioRequestUtilIsAny
     * @returns {Boolean} touchdevice true:known touchdevice false:not known as touchdevice
     */
    isTouchdevice: function () {
        if (Radio.request("Util", "isAny") === null) {
            return false;
        }
        return true;
    },

    /**
     * Rendert den Bootstrap-Toolip ins mousehoverpopup.
     * html: true - Damit <br> ausgewertet wird
     * trigger: manual - lösst Bug mit verschwindendem Tooltip
     * @param {string} text -
     * @returns {void}
     */
    render: function (text) {
        var element = this.model.get("overlay").getElement(),
            textString = "",
            template = "";

        _.each(text, function (textElement) {
            textString += textElement;
        });
        template = "<div style='bottom:5px' class='tooltip top in' role='tooltip'><div class='tooltip-inner mouseHover in'>" + textString + "</div></div>";

        $(element).empty();
        $(element).append(template);
        return this;
    },

    /**
     * creates the overlay element and appends it to the map element
     * @returns {void}
     */
    createOverlayElement: function () {
        var element = document.createElement("DIV");

        document.getElementById("map").appendChild(element);
        this.model.get("overlay").setElement(element);
    }
});

export default MouseHoverPopupView;
