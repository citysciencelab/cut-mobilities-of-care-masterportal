import FreezeTemplate from "text-loader!./template.html";

const FreezeView = Backbone.View.extend({
    events: {
        "click .freeze-view-close": "hideFreezeWin"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;

                if (changed.freezeText || changed.unfreezeText || changed.name || changed.glyphicon) {
                    this.render();
                }
            }
        });
        this.render();
    },
    collection: {},
    id: "freeze-view",
    className: "freeze-view freeze-deactivated",
    template: _.template(FreezeTemplate),
    render: function () {
        const attr = this.model.toJSON();

        $(this.$el).html(this.template(attr));
        $(".masterportal-container").append(this.$el);

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

            if ($("#table-navigation").attr("class") === "table-nav-0deg ui-draggable" || $("#table-navigation").attr("class") === "table-nav-0deg") {
                $("p.freeze-view-close").css({
                    "transform": "rotate(0deg)",
                    "-webkit-transform-origin": "50% 50%",
                    "-ms-transform-origin": "50% 50%",
                    "-moz-transform-origin": "50% 50%"
                });
            }
            else if ($("#table-navigation").attr("class") === "table-nav-90deg") {
                $("p.freeze-view-close").css({
                    "transform": "rotate(90deg)",
                    "-webkit-transform-origin": "5% 50%",
                    "-ms-transform-origin": "5% 50%",
                    "-moz-transform-origin": "5% 50%"
                });
            }
            else if ($("#table-navigation").attr("class") === "table-nav-180deg") {
                $("p.freeze-view-close").css({
                    "transform": "rotate(180deg)",
                    "-webkit-transform-origin": "40% 50%",
                    "-ms-transform-origin": "40% 50%",
                    "-moz-transform-origin": "40% 50%"
                });
            }
            else if ($("#table-navigation").attr("class") === "table-nav-270deg") {
                $("p.freeze-view-close").css({
                    "transform": "rotate(270deg)",
                    "-webkit-transform-origin": "42% 405%",
                    "-ms-transform-origin": "42% 405%",
                    "-moz-transform-origin": "42% 405%"
                });
            }
        }
    },
    hideFreezeWin: function () {
        $("div.freeze-view").removeClass("freeze-activated");
        $("div.freeze-view").addClass("freeze-deactivated");
    }
});

export default FreezeView;
