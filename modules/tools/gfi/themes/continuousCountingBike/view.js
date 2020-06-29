import ThemeView from "../view";
import ContinuousCountingBikeTemplate from "text-loader!./template.html";
/**
 * @member ContinuousCountingBikeTemplate
 * @description Template used to create gfi for continuousCountingBike
 * @memberof Tools.GFI.Themes.ContiniuousCountingBikeTheme
 */
const ContinuousCountingBikeView = ThemeView.extend(/** @lends ContiniuousCountingBikeThemeView.prototype */{
    events: {
        "click .tab-toggle": "toggleTab",
        "change input": function (evt) {
            const activeTab = this.$(".tab-toggle.active")[0].getAttribute("value");

            if (this.$(evt.target).prop("checked")) {
                this.fadeIn(evt.target.id, activeTab);
            }
            else {
                this.fadeOut(evt.target.id, activeTab);
            }
        },
        "click .csv-download": function () {
            this.model.download();
        }
    },
    /**
     * @class ContiniuousCountingBikeThemeView
     * @extends GFI.Themes
     * @memberof GFI.Themes.ContiniuousCountingBikeTheme
     * @constructs
     */
    tagName: "div",
    className: "continuousCountingBike",
    template: _.template(ContinuousCountingBikeTemplate),

    /**
     * toggleTabis called when an other tab is activated
     * deacitvates all content and initiate to create the new content for the active tab
     * @param  {event} evt click event
     * @return {void}
     */
    toggleTab: function (evt) {
        const activeTab = this.$(evt.currentTarget).attr("value"),
            activeContent = this.$("#" + activeTab),
            tabContentList = [];

        if (!Config.hasOwnProperty("uiStyle") || Config.uiStyle !== "table") {
            $(".gfi > .gfi-content").css("max-height", "80vh");
        }

        // deactivate all tabs
        this.$(evt.currentTarget).parent().find("li").each(function (index, li) {
            $(li).removeClass("active");
        });

        // get all tabContent to remove "in active" classes
        this.$(".active.continuousCountingBike").toArray().forEach(ele => {
            if (ele.getAttribute("id") !== null) {
                tabContentList.push("#" + ele.getAttribute("id"));
            }
            else if (ele.getAttribute("class") !== null) {
                tabContentList.push("." + ele.getAttribute("class").replace(/ /g, "."));
            }
        });
        this.removeClasses(tabContentList);
        // activate selected tab and its content
        this.$(evt.currentTarget).addClass("active");
        activeContent.addClass("in active");
        this.$el.find("#chart").width("auto");
        if (activeTab !== "info") {
            this.$(".continuousCountingBike.form-check").addClass("in active");
            this.$("#chart").addClass("in active");
            this.fadeIn("tableCheck", activeTab);
            this.$(".chartCheckbox").prop("checked", true);
            this.$(".tableCheckbox").prop("checked", true);
            this.loadDiagramm(activeTab);
            this.fadeInDownloadButton();
        }
        else if (activeTab === "info") {
            this.$("#gfiList").addClass("in active");
            if (!Radio.request("Util", "isViewMobile")) {
                this.rePositionGFIWindow();
            }
        }
    },

    /**
     * removeClasses removes the "in active" classes of the tab content
     * @param  {array} tabContentList array of classes
     * @return {void}
     */
    removeClasses: function (tabContentList) {
        tabContentList.forEach(tabContent => {
            this.$(tabContent).removeClass("in active");
        });
    },

    /**
     * loadDiagramm get the height and with for the graphic and transfers it to the setter in the model
     * initiates the repositioning of the gfi window
     * initiates createD3Document in the model
     * @param  {string} activeTab contains the value of the active tab
     * @return {void}
     */
    loadDiagramm: function (activeTab) {
        const height = this.$el.find("#chart").height(),
            width = this.$el.parent().width();

        this.$el.find("#chart").width(width);
        this.$(".graph svg").remove();
        this.model.setSize({height: height, width: width});
        if (!Radio.request("Util", "isViewMobile")) {
            this.rePositionGFIWindow();
        }
        this.model.createD3Document(activeTab);
    },

    /**
     * fadeIn the chart or the table in the tab content
     * @param  {string} checkbox name of the checkbox
     * @param  {string} activeTab contains the value of the active tab
     * @return {void}
     */
    fadeIn: function (checkbox, activeTab) {
        if (checkbox === "chartCheck") {
            this.$("#chart").addClass("in active");
        }
        else if (checkbox === "tableCheck") {
            this.$("#table").addClass("in active");
            this.$("#table" + activeTab).addClass("in active");
        }
    },
    /**
     * fadeOut the chart or the table in the tab content
     * @param  {string} checkbox name of the checkbox
     * @param  {string} activeTab contains the value of the active tab
     * @return {void}
     */
    fadeOut: function (checkbox, activeTab) {
        if (checkbox === "chartCheck") {
            this.$("#chart").removeClass("in active");
        }
        else if (checkbox === "tableCheck") {
            this.$("#table").removeClass("in active");
            this.$("#table" + activeTab).removeClass("in active");
        }
    },

    /**
     * fadeInDownloadButton fades in the donwload button
     * @param  {string} activeTab contains the value of the active tab
     * @return {void}
     */
    fadeInDownloadButton: function () {
        this.$(".continuousCountingBike.downloadButton").addClass("in active");
    },
    /**
     * appendChildren overrides the function to append image children to the gfi
     * in this case the images are prepended
     * @return {void}
     */
    appendChildren: function () {
        const children = this.model.get("children") !== undefined ? this.model.get("children") : [],
            imageContinuousCountingBikeDiv = this.$(".imageContinuousCountingBikeDiv");

        imageContinuousCountingBikeDiv.removeClass("has-image");
        children.forEach(element => {
            element.val.$el.prepend("<p class=imageContinuousCountingBikeP>" + element.key + ": </p>");
            if (element.type && element.type === "image") {
                imageContinuousCountingBikeDiv.append("<div class='col-xs-6 col-md-6'>" + element.val.$el[0].innerHTML + "</div>");
                imageContinuousCountingBikeDiv.addClass("has-image");
            }
        });
    },

    /**
     * rePositionGFIWindow gets the width of the gfi window and positions it depending on the map width
     * @return {void}
     */
    rePositionGFIWindow: function () {
        const mapWidth = $("#map").width(),
            posLeft = this.$el.closest(".ui-draggable").position().left,
            outerWidth = this.$el.closest(".ui-draggable").outerWidth(true);

        if (posLeft + outerWidth > mapWidth) {
            this.$el.closest(".ui-draggable").css("left", mapWidth - outerWidth - 10);
        }
    }
});

export default ContinuousCountingBikeView;
