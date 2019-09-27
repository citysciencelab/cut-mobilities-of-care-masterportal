import ThemeView from "../../view";
import BalkendiagrammThemeTemplate from "text-loader!./template.html";

const BalkendiagrammThemeView = ThemeView.extend({
    tagName: "div",
    className: "gfi-bakendiagramm",
    template: _.template(BalkendiagrammThemeTemplate),

    /**
     * @extends ThemeView
     * @memberof Tools.GFI.Themes.Balkendiagramm
     * @constructs
     */
    events: {
        "click .panel.bikeLevelHeader": "changeKat"
    },

    /**
     * Changes the category of the graph
     * @param {Event} evt Click event
     * @returns {void}
     */
    changeKat: function (evt) {
        this.$(".graph svg").remove();
        this.model.createD3Document(evt.currentTarget.id);
    }
});

export default BalkendiagrammThemeView;
