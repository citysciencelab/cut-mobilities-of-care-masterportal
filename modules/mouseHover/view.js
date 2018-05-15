define(function (require) {
    require("bootstrap/popover");
    var MouseHoverPopup = require ("modules/mouseHover/model"),
        ol = require("openlayers"),
        MouseHoverPopupView;

    MouseHoverPopupView = Backbone.View.extend({
        model: new MouseHoverPopup(),
        id: "mousehoverpopup",
        initialize: function () {
            $("#map").append("<div id='mousehoverpopup' class='col-md-offset-4 col-xs-offset-3 col-md-2 col-xs-5'></div>");

            this.model.setMhpOverlay (new ol.Overlay({
                id: "mousehoveroverlay",
                element: $("#mousehoverpopup")[0]
            }));

            this.listenTo(this.model, {
                "render": this.render,
                "move": this.move,
                "destroy": this.destroy
            });
        },

        /**
         * Rendert den Bootstrap-Toolip ins mousehoverpopup.
         * html: true - Damit <br> ausgewertet wird
         * trigger: manual - lösst Bug mit verschwindendem Tooltip
         */
        render: function (text, position) {
            var overlay = this.model.getMhpOverlay(),
                element = overlay.getElement();

            this.destroy();

            $(element).tooltip({
                html: true,
                title: text,
                template: "<div class='tooltip' role='tooltip'><div class='tooltip-inner mouseHover'></div></div>",
                placement: "auto",
                animation: true,
                trigger: "manual",
                viewport: "#map"
            }, this);

            overlay.setPosition(position);
            $(element).tooltip("show");
        },

        move: function (position) {
            var overlay = this.model.getMhpOverlay();

            overlay.setPosition(position);
        },

        destroy: function () {
            var element = this.model.getMhpOverlay().getElement();

            $(element).tooltip("destroy");
        }
    });

    return MouseHoverPopupView;
});
