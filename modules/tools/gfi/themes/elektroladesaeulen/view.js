define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        ElektroladesaeulenThemeTemplate = require("text!modules/tools/gfi/themes/elektroladesaeulen/template.html"),
        ElektroladesaeulenThemeView;

    ElektroladesaeulenThemeView = ThemeView.extend({
        tagName: "div",
        className: "ladesaeulen",
        template: _.template(ElektroladesaeulenThemeTemplate),
        events: {
            "click .tab-toggle": "toggleTab"
        },

        toggleTab: function (evt) {
            if (_.isUndefined(this.model.get("gfiHeight")) || _.isUndefined(this.model.get("gfiWidth"))) {
                var gfiSize = {
                    width: $(".gfi-content").css("width").slice(0, -2),
                    height: $(".gfi-content").css("height").slice(0, -2)
                };

                this.model.set("gfiHeight", this.model.calculateHeight(gfiSize.height));
                this.model.set("gfiWidth", gfiSize.width);
            }

            // delete all graphs
            this.removeAllData();

            var contentId = $(evt.currentTarget).attr("value"),
                index = 3;

            // deactivate all tabs and their contents
            $(evt.currentTarget).parent().find("li").each(function (index, li) {
                var tabContentId = $(li).attr("value");

                $(li).removeClass("active");
                $("#" + tabContentId).removeClass("active");
                $("#" + tabContentId).removeClass("in");
            });

            // activate selected tab and its content
            $(evt.currentTarget).addClass("active");
            $("#" + contentId).addClass("active");
            $("#" + contentId).addClass("in");

            if (contentId === "diagrammVerfuegbar") {
                this.loadDiagramm("available", ".ladesaeulenVerfuegbar-graph", index);
            }
            else if (contentId === "diagrammBelegt") {
                this.loadDiagramm("charging", ".ladesaeulenBelegt-graph", index);
            }
            else if (contentId === "diagrammAusserBetrieb") {
                this.loadDiagramm("outoforder", ".ladesaeulenAusserBetrieb-graph", index);
            }
            else if (contentId === "indikatoren") {
                this.drawIndicator(".tabIndikator");
            }
        },

        loadDiagramm: function (state, graphTag, index) {
            this.model.triggerToBarGraph(state, graphTag, index);
        },

        removeAllData: function () {
            $(".ladesaeulenVerfuegbar-graph svg").remove();
            $(".ladesaeulenBelegt-graph svg").remove();
            $(".ladesaeulenAusserBetrieb-graph svg").remove();
            $(".ladesaeulenVerfuegbar-graph p").remove();
            $(".ladesaeulenBelegt-graph p").remove();
            $(".ladesaeulenAusserBetrieb-graph p").remove();
        },

        drawIndicator: function (tag) {
            console.log("test");
            // $(tag).append("<table class=table>")
            // $(tag).append("<thead>")
        }
    });

    return ElektroladesaeulenThemeView;
});
