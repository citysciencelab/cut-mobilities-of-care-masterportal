import ThemeView from "../../view";
import BalkendiagrammThemeTemplate from "text-loader!./template.html";

const BalkendiagrammThemeView = ThemeView.extend({
    tagName: "div",
    className: "gfi-bakendiagramm",
    template: _.template(BalkendiagrammThemeTemplate),

    initialize: function () {
        // call ThemeView's initialize method explicitly
        ThemeView.prototype.initialize.apply(this);

        this.listenTo(this.model, {
            "change:isReady": this.changeKat()
        });
    },

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
    changeKat: function () {
        this.$(".graph svg").remove();
        this.model.createD3Document();
    }
});

export default BalkendiagrammThemeView;
