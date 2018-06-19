define(function (require) {
    var Backbone = require("backbone"),
        FreezeTemplate = require("text!modules/controls/freeze/template.html"),
        $ = require("jquery"),
        FreezeView;

    FreezeView = Backbone.View.extend({
        collection: {},
        id: "freeze-view",
        className: "freeze-view freeze-deactivated",
        template: _.template(FreezeTemplate),
        events: {
            "click .freeze-view-close": "hideFreezeWin"

        },
        initialize: function () {
            this.render();
        },
        render: function () {
            $(this.$el).html(this.template());
            $(".lgv-container").append(this.$el);
        },
        showFreezeWin: function () {
            $("div.freeze-view").removeClass("freeze-deactivated");
            $("div.freeze-view").addClass("freeze-activated");
            if ($(".table-nav-main").length === 0) {
                $("p.freeze-view-close").css("left", "30px");
                $("p.freeze-view-close").css("top", "30px");
            }
            else {
                $("p.freeze-view-close").css("left", $(".table-nav-main").offset().left);
                $("p.freeze-view-close").css("top", $(".table-nav-main").offset().top);
            }
        },
        hideFreezeWin: function () {
            $("div.freeze-view").removeClass("freeze-activated");
            $("div.freeze-view").addClass("freeze-deactivated");
        }
    });
    return FreezeView;
});
