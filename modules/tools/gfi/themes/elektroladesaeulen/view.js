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

        /**
         * changeGraph by click on arrowButton
         * @param  {event} evt
         */
        changeGraph: function (evt) {
            var actualIndex = this.model.get("dayIndex"),
                buttonId = evt.currentTarget.id,
                graphTyp;

            // search for atcivated data/graph
            $("li").each(function () {
                if ($(this).hasClass("active")) {
                    graphTyp = $(this).attr("value");
                }
            });

            // clean window
            this.removeAllData();

            // check wich button is clicked
            // actualIndex: today = 0, yesterday = 1, tomorrow = 6, etc.
            if (buttonId === "left") {
                (actualIndex === 6) ? actualIndex = 0 : actualIndex++;
            }
            else if (buttonId === "right") {
                (actualIndex === 0) ? actualIndex = 6 : actualIndex--;
            }

            this.setDiagrammParams(graphTyp, actualIndex);
       },

        /**
         * changes dataset, which draw in gfi
         * @param  {event} evt
         */
        toggleTab: function (evt) {
            var contentId = $(evt.currentTarget).attr("value"),
                modelDayIndex = this.model.get("dayIndex"),
                index = _.isUndefined(modelDayIndex) ? 0 : modelDayIndex;

            // sets the window size so that it is always the same
            if (_.isUndefined(this.model.get("gfiHeight")) || _.isUndefined(this.model.get("gfiWidth"))) {
                var gfiSize = {
                    width: $(".gfi-content").css("width").slice(0, -2),
                    height: $(".gfi-content").css("height").slice(0, -2)
                };

                this.model.setGfiHeight(this.calculateHeight(gfiSize.height));
                this.model.setGfiWidth(gfiSize.width);
                this.model.setIndicatorGfiHeight(this.calculateIndicatorHeight(gfiSize.height));
            }

            // delete all graphs an data
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
                heightNavbar = $(".ladesaeulen .nav").css("height").slice(0, -2),
                heightbutton = $(".ladesaeulen .buttonDiv").css("height").slice(0, -2);

            return gfiHeight - heightladesaeulenHeader - heightNavbar - heightbutton;
        },

        /**
         * Reduce height by the size of the button
         * @param  {number} gfiHeight
         * @return {number} gfiHeight - without height from arrow buttons
         */
        calculateIndicatorHeight: function (gfiHeight) {
            var heightladesaeulenHeader = $(".ladesaeulenHeader").css("height").slice(0, -2),
                heightNavbar = $(".ladesaeulen .nav").css("height").slice(0, -2);

            return gfiHeight - heightladesaeulenHeader - heightNavbar;
        },

        /**
         * sets the diagrams or data and hides the arrow buttons if necessary
         * @param {String} contentId
         * @param {number} index - represents the weekday, today = 0
         */
        setDiagrammParams: function (contentId, index) {
            if (contentId === "daten") {
                Radio.trigger("gfiView", "render");
                $(".ladesaeulen .buttonDiv").hide();
            }
            else if (contentId === "diagrammVerfuegbar") {
                this.loadDiagramm("available", ".ladesaeulenVerfuegbar-graph", index);
                $(".ladesaeulen .buttonDiv").show();
            }
            else if (contentId === "diagrammBelegt") {
                this.loadDiagramm("charging", ".ladesaeulenBelegt-graph", index);
                $(".ladesaeulen .buttonDiv").show();
            }
            else if (contentId === "diagrammAusserBetrieb") {
                this.loadDiagramm("outoforder", ".ladesaeulenAusserBetrieb-graph", index);
                $(".ladesaeulen .buttonDiv").show();
            }
            else if (contentId === "indikatoren") {
                // starts calculate indicators
                this.model.createIndicators(false);
                this.drawIndicator(".tabIndikator-pane");
                $(".ladesaeulen .buttonDiv").hide();
            }
        },

        /**
         * starts drawing the graphs in model
         * @param  {String} state - category from data
         * @param  {String} graphTag - container for special graph in html
         * @param  {number} index - weekday
         */
        loadDiagramm: function (state, graphTag, index) {
            this.model.triggerToBarGraph(state, graphTag, index);
        },

        /**
         * clean gfi-window to create space for new data
         */
        removeAllData: function () {
            $(".ladesaeulenVerfuegbar-graph svg").remove();
            $(".ladesaeulenBelegt-graph svg").remove();
            $(".ladesaeulenAusserBetrieb-graph svg").remove();
            $(".ladesaeulenVerfuegbar-graph .noData").remove();
            $(".ladesaeulenBelegt-graph .noData").remove();
            $(".ladesaeulenAusserBetrieb-graph .noData").remove();
            $(".ladesaeulen .indicatorTable").remove();
        },

        /**
         * draws different indicators such as the total number of chargings
         * data is calculated in the model
         * @param  {String} dataTag - container to draw data
         */
        drawIndicator: function (dataTag) {
            var tableHead = this.model.get("tableheadIndicatorArray"),
                properties = this.model.get("indicatorPropertiesObj"),
                height = this.model.get("indicatorGfiHeight"),
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
            $(".ladesaeulen " + dataTag).append(content);
        }
    });

    return ElektroladesaeulenThemeView;
});
