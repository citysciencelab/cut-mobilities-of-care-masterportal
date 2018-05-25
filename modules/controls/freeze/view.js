define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        FreezeTemplate = require("text!modules/tools/freeze/template.html"),
        FreezeModel = require("modules/tools/freeze/model"),
        $ = require("jquery"),
        Radio = require("backbone.radio"),
        FreezeView;

    FreezeView = Backbone.View.extend({
        model: FreezeModel,
        collection: {},
        id: "freeze-view",
        className: "freeze-view",
        template: _.template(FreezeTemplate),
        events: {
            "click .freeze-view-close": "toggleFreezeWin"
        },
        initialize: function () {
            this.listenTo(Radio.channel("Freeze"), {
                "toggleFreezeWin": this.toggleFreezeWin
            });

            this.render();
        },
        render: function () {
            $(this.el).html(this.template());
            $(".lgv-container").append(this.$el);
        },
        toggleFreezeWin: function () {
            if (this.model.getVisible()) {
                $("div.freeze-view").css("height", "10px");
                $("div.freeze-view").css("width", "10px");
                $("div.freeze-view").removeClass("freeze-activated");
                $("p.freeze-view-close").css("left", "0px");
                $("p.freeze-view-close").css("top", "0px");
                this.model.setVisible(false);
            }
            else {
                $("div.freeze-view").css("height", ($(".lgv-container").height()));
                $("div.freeze-view").css("width", ($(".lgv-container").width()));
                $("div.freeze-view").addClass("freeze-activated");
                if ($(".icon-tools")) {
                    $("p.freeze-view-close").css("left", ($(".icon-tools").offset().left));
                    $("p.freeze-view-close").css("top", ($(".icon-tools").offset().top));
                }
                else {
                    $("p.freeze-view-close").css("left", "30px");
                    $("p.freeze-view-close").css("top", "30px");
                }
                this.model.setVisible(true);
            }
        }
    });
        return FreezeView;
});
