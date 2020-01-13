import {expect} from "chai";
import Model from "@modules/tools/gfi/themes/sensor/model.js";
import Feature from "ol/Feature";

describe("tools/gfi/themes/sensor", function () {
    let model;

    before(function () {
        model = new Model();
    });
    describe("getGrafanaUrlsFromFeature", function () {
        it("should return all attributes starting with 'grafana_url'", function () {
            const feature = new Feature();

            feature.set("grafana_url_1", "test123");
            feature.set("grafana_url_2", "test456");
            expect(model.getGrafanaUrlsFromFeature(feature)).to.deep.equal({
                grafana_url_1: "test123",
                grafana_url_2: "test456"
            });
        });
        it("should return empty object, because no attribute starting with 'grafana_url' is available [1]", function () {
            const feature = new Feature();

            expect(model.getGrafanaUrlsFromFeature(feature)).to.deep.equal({});
        });

        it("should return empty object, because no attribute starting with 'grafana_url' is available [2]", function () {
            const feature = new Feature();

            feature.set("1_grafana_url", "test123");
            expect(model.getGrafanaUrlsFromFeature(feature)).to.deep.equal({});
        });

        it("should return empty object if feature is undefined", function () {
            expect(model.getGrafanaUrlsFromFeature(undefined)).to.deep.equal({});
        });
    });
});
