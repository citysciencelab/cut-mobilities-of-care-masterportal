import getTheme from "../../../utils/getTheme";
import Default from "../../../components/themes/default/components/Default.vue";
import Sensor from "../../../components/themes/sensor/components/Sensor.vue";

import {expect} from "chai";

describe("getTheme", () => {
    const components = {Default, Sensor};

    describe("getTheme", () => {
        it("return the theme contained in addons", function () {
            const themeFromFeature = "schulinfo",
                addonThemes = ["Trinkwasser", "Schulinfo", "ContinuousCountingBike"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("Schulinfo");
        });
        it("return Default-theme, because the theme is not contained in addons", function () {
            const themeFromFeature = "schulinfo",
                addonThemes = ["Trinkwasser", "SchulinfoXXX", "ContinuousCountingBike"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("Default");
        });
        it("return Sensor-theme, because the theme is configured and available", function () {
            const themeFromFeature = "Sensor",
                addonThemes = ["Trinkwasser", "Schulinfo", "ContinuousCountingBike"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("Sensor");
        });
        it("return Default-theme, if theme from feature is not defined", function () {
            const themeFromFeature = undefined,
                addonThemes = ["Trinkwasser", "Schulinfo", "ContinuousCountingBike"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("Default");
        });
        it("return Default-theme, if theme from feature is null", function () {
            const themeFromFeature = null,
                addonThemes = ["Trinkwasser", "Schulinfo", "ContinuousCountingBike"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("Default");
        });

    });

});
