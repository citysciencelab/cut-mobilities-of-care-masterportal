import ThemeView from "../view";
import SensorTemplate from "text-loader!./template.html";

const SensorThemeView = ThemeView.extend(/** @lends SensorThemeView.prototype */{
    /**
    * @class SensorThemeView
    * @memberof Tools.GFI.Themes.Sensor
    * @constructs
    */
    tagName: "div",
    className: "sensor",
    /**
     * @member SensorTemplate
     * @description Template used to create the sensor gfi.
     * @memberof Tools.GFI.Themes.Sensor
     */
    template: _.template(SensorTemplate),
    events: {
        "click .tab-toggle": "activateGraph"
    },

    /**
     * Activates or deactivates the graph tab.
     * @param {Event} evt Click-event.
     * @returns {void}
     */
    activateGraph: function (evt) {
        const value = $(evt.currentTarget).attr("value");

        this.$el.find("#grafana").addClass("hide");
        this.$el.find("#data").addClass("hide");

        if (value === "grafana") {
            this.$el.find("#grafana").removeClass("hide");
        }
        else if (value === "data") {
            this.$el.find("#data").removeClass("hide");
        }
        else {
            console.error("value: " + value + " is not implemented yet");
        }
    }
});

export default SensorThemeView;
