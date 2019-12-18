import ThemeView from "../view";
import SensorTemplate from "text-loader!./template.html";

const SensorThemeView = ThemeView.extend({
    tagName: "div",
    className: "sensor",
    template: _.template(SensorTemplate),
    events: {
        "click .tab-toggle": "activateGraph"
    },
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
