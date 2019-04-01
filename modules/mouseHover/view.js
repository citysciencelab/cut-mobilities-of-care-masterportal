import MouseHoverPopup from "./model";

const MouseHoverPopupView = Backbone.View.extend({
    initialize: function (attr) {
        this.model = new MouseHoverPopup(attr);
        this.listenTo(this.model, {
            "render": this.render,
            "destroy": this.destroy
        });

        this.createOverlayElement();
    },

    /**
     * Renders the Bootstrap-Tooltip into the mousehoverpopup
     * html: true - So that <br> will be integrated
     * trigger: manual - solves bug with hiding tooltip
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
