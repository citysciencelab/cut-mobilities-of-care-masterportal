import ThemeView from "../view";
import ElektroladesaeulenThemeTemplate from "text-loader!./template.html";

const ElektroladesaeulenThemeView = ThemeView.extend({
    tagName: "div",
    className: "ladesaeulen",
    template: _.template(ElektroladesaeulenThemeTemplate),
    events: {
        "click .tab-toggle": "toggleTab",
        "click .kat": "changeGraph"
    },

    /**
     * changeGraph by click on arrowButton
     * @param  {event} evt - event that is triggered
     * @returns {void}
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
            actualIndex = actualIndex === 6 ? 0 : actualIndex + 1;
        }
        else if (buttonId === "right") {
            actualIndex = actualIndex === 0 ? 6 : actualIndex - 1;
        }

        this.setDiagrammParams(graphTyp, actualIndex);
    },

    /**
     * changes dataset, which draw in gfi
     * @param  {event} evt - event that is triggered
     * @returns {void}
     */
    toggleTab: function (evt) {
        var contentId = $(evt.currentTarget).attr("value"),
            modelDayIndex = this.model.get("dayIndex"),
            index = _.isUndefined(modelDayIndex) ? 0 : modelDayIndex,
            gfiSize;

        // sets the window size so that it is always the same
        if (_.isUndefined(this.model.get("gfiHeight")) || _.isUndefined(this.model.get("gfiWidth"))) {
            gfiSize = {
                width: $(".gfi-content").css("width").slice(0, -2),
                height: $(".gfi-content").css("height").slice(0, -2)
            };

            this.model.setGfiHeight(this.calculateHeight(gfiSize.height));
            this.model.setGfiWidth(gfiSize.width);
        }

        // delete all graphs an data
        this.removeAllData();

        // deactivate all tabs and their contents
        $(evt.currentTarget).parent().find("li").each(function (i, li) {
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
     * @return {String} availableHeight
     */
    calculateHeight: function (gfiHeight) {
        var heightladesaeulenHeader = $(".ladesaeulenHeader").css("height").slice(0, -2),
            heightNavbar = $(".ladesaeulen .nav").css("height").slice(0, -2),
            heightbutton = $(".ladesaeulen .buttonDiv").css("height").slice(0, -2);

        return gfiHeight - heightladesaeulenHeader - heightNavbar - heightbutton;
    },

    /**
     * Reduce height by the size of the button
     * @param  {number} gfiHeight - height from gfi
     * @return {number} gfiHeight - without height from arrow buttons
     */
    calculateIndicatorHeight: function (gfiHeight) {
        var heightladesaeulenHeader = $(".ladesaeulenHeader").css("height").slice(0, -2),
            heightNavbar = $(".ladesaeulen .nav").css("height").slice(0, -2);

        return gfiHeight - heightladesaeulenHeader - heightNavbar;
    },

    /**
     * sets the diagrams or data and hides the arrow buttons if necessary
     * @param {String} contentId - id from list item
     * @param {number} index - represents the weekday, today = 0
     * @returns {void}
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
    },

    /**
     * starts drawing the graphs in model
     * @param  {String} state - category from data
     * @param  {String} graphTag - container for special graph in html
     * @param  {number} index - weekday
     * @returns {void}
     */
    loadDiagramm: function (state, graphTag, index) {
        this.model.triggerToBarGraph(state, graphTag, index);
    },

    /**
     * clean gfi-window to create space for new data
     * @returns {void}
     */
    removeAllData: function () {
        $(".ladesaeulenVerfuegbar-graph svg").remove();
        $(".ladesaeulenBelegt-graph svg").remove();
        $(".ladesaeulenAusserBetrieb-graph svg").remove();
        $(".ladesaeulenVerfuegbar-graph .noData").remove();
        $(".ladesaeulenBelegt-graph .noData").remove();
        $(".ladesaeulenAusserBetrieb-graph .noData").remove();
    }
});

export default ElektroladesaeulenThemeView;
