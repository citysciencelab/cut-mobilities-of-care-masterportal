import ThemeView from "../view";
import VerkehrsStaerkenThemeTemplate from "text-loader!./template.html";

const VerkehrsStaerkenThemeView = ThemeView.extend(/** @lends VerkehrsStaerkenThemeView.prototype*/{
    tagName: "div",
    className: "verkehrsstaerken",
    /**
     * @member VerkehrsStaerkenThemeTemplate
     * @description Template used to create gfi for Verkehrsstaerken
     * @memberof Tools.GFI.Themes.VerkehrsStaerken
     */
    template: _.template(VerkehrsStaerkenThemeTemplate),
    /**
     * @class VerkehrsStaerkenThemeView
     * @extends ThemeView
     * @memberof Tools.GFI.Themes.VerkehrsStaerken
     * @constructs
     */
    events: {
        "click .kat": "changeKat",
        "click .tab-toggle": "toggleTab"
    },

    /**
     * Changes the category of the graph
     * @param {Event} evt Click event
     * @returns {void}
     */
    changeKat: function (evt) {
        this.$(".graph svg").remove();
        this.$(".btn-group").children("button").each(function () {
            if ($(this)[0].id === evt.currentTarget.id) {
                $(this).addClass("active");
            }
            else {
                $(this).removeClass("active");
            }
        });
        this.model.createD3Document(evt.currentTarget.id);
    },

    /**
     * Creates the Diagramm
     * @returns {void}
     */
    loadDiagramm: function () {
        var attr = this.$("#diagramm").find(".active")[0].value;

        this.$(".graph svg").remove();
        this.model.createD3Document(attr);
    },

    /**
     * Toggles the tabs between the table and the diagram
     * @param {Event} evt Click event
     * @returns {void}
     */
    toggleTab: function (evt) {
        var contentId = this.$(evt.currentTarget).attr("value");

        // deactivate all tabs and their contents
        this.$(evt.currentTarget).parent().find("li").each(function (index, li) {
            var tabContentId = $(li).attr("value");

            $(li).removeClass("active");
            $("#" + tabContentId).removeClass("active");
            $("#" + tabContentId).removeClass("in");
        });
        // activate selected tab and its content
        this.$(evt.currentTarget).addClass("active");
        this.$("#" + contentId).addClass("active");
        this.$("#" + contentId).addClass("in");
        if (contentId === "diagramm") {
            this.loadDiagramm();
        }
    }
});

export default VerkehrsStaerkenThemeView;
