import {expect} from "chai";
import {createGfiFeature, openFeaturesInNewWindow, getXmlFeatures, getHtmlFeature, getWmsFeaturesByMimeType} from "../../../store/actions/getWmsFeaturesByMimeType.js";

describe("src/modules/map/store/actions/getWmsFeaturesByMimeType.js", () => {
    describe("createGfiFeature", () => {
        it("should return an object with specific functions to get the given params", () => {
            const feature = createGfiFeature("layerName", "gfiTheme", "https://url/einzelmarker_dunkel.png", "attributesToShow", "featureProperties", "gfiFormat", "id", "url");

            expect(feature).to.be.an("object");

            expect(feature.getGfiUrl).to.be.a("function");
            expect(feature.getTitle).to.be.a("function");
            expect(feature.getTheme).to.be.a("function");
            expect(feature.getIconPath).to.be.a("function");
            expect(feature.getAttributesToShow).to.be.a("function");
            expect(feature.getProperties).to.be.a("function");
            expect(feature.getGfiFormat).to.be.a("function");
            expect(feature.getId).to.be.a("function");

            expect(feature.getGfiUrl()).to.equal("url");
            expect(feature.getTitle()).to.equal("layerName");
            expect(feature.getTheme()).to.equal("gfiTheme");
            expect(feature.getIconPath()).to.equal("https://url/einzelmarker_dunkel.png");
            expect(feature.getAttributesToShow()).to.equal("attributesToShow");
            expect(feature.getProperties()).to.equal("featureProperties");
            expect(feature.getGfiFormat()).to.equal("gfiFormat");
            expect(feature.getId()).to.equal("id");
        });
    });

    describe("openFeaturesInNewWindow", () => {
        it("should return false if any funny params are given", () => {
            let result = false;

            result = openFeaturesInNewWindow();
            expect(result).to.be.false;

            result = openFeaturesInNewWindow(1234);
            expect(result).to.be.false;

            result = openFeaturesInNewWindow("url", 1234);
            expect(result).to.be.false;

            result = openFeaturesInNewWindow("url", "gfiAsNewWindow");
            expect(result).to.be.false;

            result = openFeaturesInNewWindow("url", {}, 1234);
            expect(result).to.be.false;
        });
        it("should call the openWindow function if gfiAsNewWindow is an object", () => {
            let lastUrl = "";
            const result = openFeaturesInNewWindow("url", {}, (url) => {
                lastUrl = url;
            });

            expect(result).to.be.true;
            expect(lastUrl).to.equal("url");
        });
        it("should not call the openWindow function if gfiAsNewWindow is null", () => {
            let lastUrl = "";
            const result = openFeaturesInNewWindow("url", null, (url) => {
                lastUrl = url;
            });

            expect(result).to.be.false;
            expect(lastUrl).to.be.empty;
        });
        it("should call the openWindow function if gfiAsNewWindow is null but the url starts with 'http:'", () => {
            let lastUrl = "";
            const result = openFeaturesInNewWindow("http:url", {}, (url) => {
                lastUrl = url;
            });

            expect(result).to.be.true;
            expect(lastUrl).to.equal("http:url");
        });
        it("should call the openWindow function with the params from gfiAsNewWindow", () => {
            let lastUrl = "",
                lastName = "",
                lastSpecs = "";
            const result = openFeaturesInNewWindow("url", {
                name: "name",
                specs: "specs"
            }, (url, name, specs) => {
                lastUrl = url;
                lastName = name;
                lastSpecs = specs;
            });

            expect(result).to.be.true;
            expect(lastUrl).to.equal("url");
            expect(lastName).to.equal("name");
            expect(lastSpecs).to.equal("specs");
        });
    });

    describe("getXmlFeatures", () => {
        it("should call requestGfi with mimeType text/xml and the given url", async () => {
            let lastMimeType = "",
                lastUrl = "";

            await getXmlFeatures("url", "layerName", "gfiTheme", "gfiIconPath", "attributesToShow", (mimeType, url) => {
                // dummy for requestGfi
                lastMimeType = mimeType;
                lastUrl = url;

                return new Promise(resolve => {
                    resolve([]);
                });
            });

            expect(lastMimeType).to.equal("text/xml");
            expect(lastUrl).to.equal("url");
        });
        it("should call requestGfi and return a wms feature with the received properties", async () => {
            const result = await getXmlFeatures("url", "layerName", "gfiTheme", "gfiIconPath", "attributesToShow", () => {
                // dummy for requestGfi
                return new Promise(resolve => {
                    // simulation of featureInfos[feature{getProperties()}]
                    resolve([{
                        getProperties: () => "featureProperties",
                        getId: () => "id"
                    }]);
                });
            });

            expect(result).to.be.an("array").to.have.lengthOf(1);
            expect(result[0]).to.be.an("object");

            expect(result[0].getGfiUrl).to.be.a("function");
            expect(result[0].getTitle).to.be.a("function");
            expect(result[0].getTheme).to.be.a("function");
            expect(result[0].getIconPath).to.be.a("function");
            expect(result[0].getAttributesToShow).to.be.a("function");
            expect(result[0].getProperties).to.be.a("function");

            expect(result[0].getGfiUrl()).to.equal("url");
            expect(result[0].getTitle()).to.equal("layerName");
            expect(result[0].getIconPath()).to.equal("gfiIconPath");
            expect(result[0].getTheme()).to.equal("gfiTheme");
            expect(result[0].getAttributesToShow()).to.equal("attributesToShow");
            expect(result[0].getProperties()).to.equal("featureProperties");
        });
    });

    describe("getHtmlFeature", () => {
        it("should call requestGfi with mimeType text/html and the given url", async () => {
            let lastMimeType = "",
                lastUrl = "";

            await getHtmlFeature("url", "layerName", "gfiTheme", "gfiIconPath", "attributesToShow", (mimeType, url) => {
                // dummy for requestGfi
                lastMimeType = mimeType;
                lastUrl = url;

                return new Promise(resolve => {
                    resolve(undefined);
                });
            });

            expect(lastMimeType).to.equal("text/html");
            expect(lastUrl).to.equal("url");
        });
    });

    describe("getWmsFeaturesByMimeType", () => {
        it("should call openWindow before anything else if http: url is given", async () => {
            let calledOpenWindow = false;
            const result = await getWmsFeaturesByMimeType("text/xml", "http:url", {layerName: "layerName", layerId: "layerId"}, "gfiTheme", "gfiIconPath", "attributesToShow", null, "requestGfi", () => {
                calledOpenWindow = true;
            });

            expect(calledOpenWindow).to.be.true;
            expect(result).to.be.an("array").to.be.empty;
        });
        it("should call requestGfi if mimeType text/xml is given", async () => {
            const result = await getWmsFeaturesByMimeType("text/xml", "url", {layerName: "layerName", layerId: "layerId"}, "gfiTheme", "gfiIconPath", "attributesToShow", null, () => {
                // dummy for requestGfi
                return new Promise(resolve => {
                    // simulation of featureInfos[feature{getProperties()}]
                    resolve([{
                        getProperties: () => "featureProperties",
                        getId: () => "id"
                    }]);
                });
            }, () => {
                return true;
            });

            expect(result).to.be.an("array").to.have.lengthOf(1);
            expect(result[0]).to.be.an("object");
            expect(result[0].getProperties).to.be.a("function");
            expect(result[0].getProperties()).to.equal("featureProperties");
        });
        it("should call requestGfi if mimeType text/html is given", async () => {
            const result = await getWmsFeaturesByMimeType("text/html", "url", "layerName", "gfiTheme", "gfiIconPath", "attributesToShow", null, () => {
                // dummy for requestGfi
                return new Promise(resolve => {
                    // simulation of featureInfos[feature{getProperties()}]
                    resolve(undefined);
                });
            }, () => {
                return true;
            });

            expect(result).to.be.empty;
        });
    });
});
