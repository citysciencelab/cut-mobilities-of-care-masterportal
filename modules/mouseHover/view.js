define([
    "backbone",
    "backbone.radio",
    "modules/mouseHover/model"
], function (Backbone, Radio, MouseHoverPopup) {

    var MouseHoverPopupView = Backbone.View.extend({
        model: MouseHoverPopup,
        id: "mousehoverpopup",
        initialize: function () {
            this.listenTo(this.model, "change:mhpresult", this.render);

            Radio.trigger("Map", "addOverlay", this.model.get("mhpOverlay"));
        },
        /**
        * html = true damit </br> korrekt bei cluster
        * erkannt werden
        */
        render: function () {
            console.log(this.model.get("mhpresult"));
            $(this.model.get("element")).tooltip({
                html: true,
                title: this.model.get("mhpresult"),
                placement: "auto",
                position: {my: "left center", at: "left center", of: $("#map"), collision: "flipfit" },
                template: "<div class='tooltip' role='tooltip'><div class='tooltip-inner mouseHover'></div></div>",
                animation: true
            });
            this.model.showPopup();
        }
    });

    return MouseHoverPopupView;
});
