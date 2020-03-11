import ThemeView from "../view";
import TrafficCountTemplate from "text-loader!./template.html";

const TrafficCountView = ThemeView.extend(/** @lends TrafficCountView.prototype */{
    /**
    * @class TrafficCountView
    * @memberof Tools.GFI.Themes.TrafficCount
    * @constructs
    */
    initialize: function () {
        // call ThemeView's initialize method explicitly
        ThemeView.prototype.initialize.apply(this);

        this.listenTo(this.model, {
            "change:lastUpdate": this.renderLastUpdate
        });
    },
    tagName: "div",

    /**
     * @member TrafficCountTemplate
     * @description Template used to create the trafficCount gfi.
     * @memberof Tools.GFI.Themes.TrafficCount
     */
    template: _.template(TrafficCountTemplate),

    /**
     * render lastUpdate
     * @param   {string} model containing model
     * @param   {string} value element value
     * @returns {void}
     */
    renderLastUpdate: function (model, value) {
        this.$el.find("#lastUpdate").text(value);
    }
});

export default TrafficCountView;
