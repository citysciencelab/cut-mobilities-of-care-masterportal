define([
    "underscore",
    "backbone",
    "models/MouseHoverPopup",
    "eventbus",
    "bootstrap"
], function (_, Backbone, MouseHoverPopup, EventBus) {

    var MouseHoverPopupView = Backbone.View.extend({
        model: MouseHoverPopup,
        id: "mousehoverpopup",
        initialize: function () {
            this.listenTo(this.model, "change:mhpresult", this.render);
            EventBus.on("closeMouseHoverPopup", this.destroy, this);
            EventBus.trigger("addOverlay", this.model.get("mhpOverlay"));
        },
        /**
        * html = true damit </br> korrekt bei cluster
        * erkannt werden
        */
        render: function () {
            $(this.model.get("element")).tooltip({
                html: true,
                title: this.model.get("mhpresult"),
                placement: "auto",
                template: "<div class='tooltip' role='tooltip'><div class='tooltip-inner mouseHover'></div></div>",
                animation: true
            });
            this.model.showPopup();
        },
        destroy: function () {
            this.model.destroyPopup();
        }
    });
    return MouseHoverPopupView;
});
