define(function (require) {
    var Backbone = require ("backbone"),
        Radio = require("backbone.radio"),
        MouseHoverPopup = require ("modules/mouseHover/model"),
        MouseHoverPopupView;

    MouseHoverPopupView = Backbone.View.extend({
        model: new MouseHoverPopup(),
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
            $(this.model.get("element")).tooltip({
                html: true,
                title: this.model.get("mhpresult"),
                placement: function () {
                    position = this.getPosition().top;
                    if (this.getPosition().top > $("#map").height() / 2) {
                        return "top";
                    }
                    else {
                        return "bottom";
                    }
                },
                template: "<div class='tooltip' role='tooltip'><div class='tooltip-inner mouseHover'></div></div>",
                animation: true,
                viewport: "#map"
            });
            this.model.showPopup();
        }
    });

    return MouseHoverPopupView;
});
