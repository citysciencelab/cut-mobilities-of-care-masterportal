define(function (require) {

    var ThemeView = require("modules/tools/gfi/themes/view"),
        ElektroladesaeulenThemeTemplate = require("text!modules/tools/gfi/themes/elektroladesaeulen/template.html"),
        Config = require("config"),
        ElektroladesaeulenThemeView;

    ElektroladesaeulenThemeView = ThemeView.extend({
        tagName: "div",
        className: "ladesaeulen",
        template: _.template(ElektroladesaeulenThemeTemplate),
        events: {
            "click .tab-toggle": "toggleTab",
            "click .kat": "changeGraph"
        },

       changeGraph: function (evt) {
            var actualIndex = this.model.get("dayIndex"),
                buttonId = evt.currentTarget.id,
                graphTyp = evt.currentTarget.parentElement.id;

            this.removeAllData();

            if (buttonId === "left") {
                (actualIndex === 6) ? actualIndex = 0 : actualIndex++;
            }
            else if (buttonId === "right") {
                (actualIndex === 0) ? actualIndex = 6 : actualIndex--;
            }

            this.setDiagrammParams(graphTyp, actualIndex);
       },

        toggleTab: function (evt) {
            var contentId = $(evt.currentTarget).attr("value"),
                modelDayIndex = this.model.get("dayIndex"),
                index = _.isUndefined(modelDayIndex) ? 0 : modelDayIndex;

            if (_.isUndefined(this.model.get("gfiHeight")) || _.isUndefined(this.model.get("gfiWidth"))) {
                var gfiSize = {
                    width: $(".gfi-content").css("width").slice(0, -2),
                    height: $(".gfi-content").css("height").slice(0, -2)
                };

                this.model.setGfiHeight(this.calculateHeight(gfiSize.height));
                this.model.setGfiWidth(gfiSize.width);
            }

            // delete all graphs
            this.removeAllData();

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

            this.setDiagrammParams(contentId, index);
        },

        /**
         * calculates the available height for the graph
         * @param  {number} gfiHeight - height of the already drwan gfi
         * @return {String}
         */
        calculateHeight: function (gfiHeight) {
            var heightladesaeulenHeader = $(".ladesaeulenHeader").css("height").slice(0, -2),
                heightNavbar = $(".ladesaeulen .nav").css("height").slice(0, -2);

            return gfiHeight - heightladesaeulenHeader - heightNavbar;
        },

        setDiagrammParams: function (contentId, index) {
            // hide all buttons with arrows
            $(".ladesaeulen .kat").hide();

            if (contentId === "daten") {
                Radio.trigger("gfiView", "render");
            }
            else if (contentId === "diagrammVerfuegbar") {
                this.loadDiagramm("available", ".ladesaeulenVerfuegbar-graph", index);
                $(".ladesaeulen .verfuegbarButton").show();
            }
            else if (contentId === "diagrammBelegt") {
                this.loadDiagramm("charging", ".ladesaeulenBelegt-graph", index);
                $(".ladesaeulen .belegtButton").show();
            }
            else if (contentId === "diagrammAusserBetrieb") {
                this.loadDiagramm("outoforder", ".ladesaeulenAusserBetrieb-graph", index);
                $(".ladesaeulen .ausserBetriebButton").show();
            }
            else if (contentId === "indikatoren") {
                this.model.loadIndicatorData();
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
            $(".ladesaeulenVerfuegbar-graph .noData").remove();
            $(".ladesaeulenBelegt-graph .noData").remove();
            $(".ladesaeulenAusserBetrieb-graph .noData").remove();
            $(".ladesaeulen .indicatorTable").remove();
        },

        drawIndicator: function (tag) {
            var tableHead = this.model.get("tableheadIndicatorArray"),
                properties = this.model.get("indicatorPropertiesObj"),
                height = this.model.get("gfiHeight"),
                width = this.model.get("gfiWidth"),
                content = "<table width='" + width + "' height='" + height + "' class='table indicatorTable'><thead><tr class='row' height='1'><th>Indikator</th>";

            _.each(tableHead, function (head) {
                content += "<th>" + head + "</th>";
            });

            content += "</tr></thead><tbody>";

            _.each(properties, function (value, key) {
                content += "<tr class='row'><th height='1'>" + key + "</th>";
                _.each(value, function (val) {
                    content += "<td>" + val + "</td>";
                });
                content += "</tr>";
            });

            content += "</tbody></table>";
            $(".ladesaeulen .tabIndikator-pane").append(content);
        }
    });

    return ElektroladesaeulenThemeView;
});
