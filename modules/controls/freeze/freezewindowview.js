import FreezeTemplate from "text-loader!./template.html";

const FreezeView = Backbone.View.extend({
    events: {
        "click .freeze-view-close": "hideFreezeWin"
    },
    initialize: function () {
        this.render();
    },
    collection: {},
    id: "freeze-view",
    className: "freeze-view freeze-deactivated",
    template: _.template(FreezeTemplate),
    render: function () {
        $(this.$el).html(this.template());
        $(".lgv-container").append(this.$el);

        return this;
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

export default FreezeView;
