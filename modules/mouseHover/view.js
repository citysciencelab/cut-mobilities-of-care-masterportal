define(function (require) {
    var MouseHoverPopup = require("modules/mouseHover/model"),
        $ = require("jquery"),
        MouseHoverPopupView;

    require("bootstrap/popover");

    MouseHoverPopupView = Backbone.View.extend({
        initialize: function (attr) {
            this.model = new MouseHoverPopup(attr);
            this.listenTo(this.model, {
                "render": this.render,
                "destroy": this.destroy
            });

            this.createOverlayElement();
        },

        /**
         * Rendert den Bootstrap-Toolip ins mousehoverpopup.
         * html: true - Damit <br> ausgewertet wird
         * trigger: manual - lösst Bug mit verschwindendem Tooltip
         * @param {string} text -
         * @returns {void}
         */
        render: function (text) {
            var element = this.model.get("overlay").getElement();

            $(element).tooltip("destroy");
            $(element).tooltip({
                html: true,
                title: text,
                template: "<div class='tooltip' role='tooltip'><div class='tooltip-inner mouseHover'></div></div>",
                placement: "auto",
                animation: true,
                trigger: "manual",
                viewport: "#map"
            }, this);
            $(element).tooltip("show");
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

    return MouseHoverPopupView;
});
