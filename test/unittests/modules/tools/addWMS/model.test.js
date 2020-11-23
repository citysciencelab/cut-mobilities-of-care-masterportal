import Model from "@modules/tools/addWMS/model.js";
import {expect} from "chai";

describe("addWMS/model", function () {
    let model;

    before(function () {
        model = new Model();
    });

    describe("getParsedTitle", function () {
        it("should return parsed title without space and be replaced with minus", function () {
            expect(model.getParsedTitle("test title")).to.equal("test-title");
        });
        it("should return parsed title without slash and be replaced with minus", function () {
            expect(model.getParsedTitle("test/title")).to.equal("test-title");
        });
        it("should return parsed title as original title", function () {
            expect(model.getParsedTitle(undefined)).to.equal("undefined");
            expect(model.getParsedTitle("test")).to.equal("test");
            expect(model.getParsedTitle(1234)).to.equal("1234");
        });
    });

    describe("isVersionEnabled", function () {
        it("should return false if the type of version is not string", function () {
            expect(model.isVersionEnabled(null)).to.be.false;
        });
        it("should return false if the version is lower than 1.3.0", function () {
            expect(model.isVersionEnabled("0.3.0")).to.be.false;
            expect(model.isVersionEnabled("1.2.9")).to.be.false;
        });
        it("should return true if the version is equal or higher than 1.3.0", function () {
            expect(model.isVersionEnabled("1.3.0")).to.be.true;
            expect(model.isVersionEnabled("2.3.5")).to.be.true;
        });
    });

    describe("getIfInExtent", function () {
        let capability = {
                Capability: {
                    Layer: {
                        "BoundingBox": [
                            {
                                "crs": "EPSG:25832",
                                "extent": [
                                    302907.887193,
                                    5435104.982326,
                                    389523.673913,
                                    5508222.768538
                                ]
                            }
                        ]
                    }
                }
            },
            currentExtent = [];

        it("schould return false if the currentExtent does not intersect the capability extent", function () {
            currentExtent = [
                455000,
                5809000,
                730000,
                6075800
            ];
            expect(model.getIfInExtent(capability, currentExtent)).to.be.false;
        });

        it("schould return true if the currentExtent intersects the capability extent", function () {
            currentExtent = [
                205000,
                5009000,
                730000,
                6075800
            ];
            expect(model.getIfInExtent(capability, currentExtent)).to.be.true;
        });

        it("schould return true if the currentExtent intersects the capability extent", function () {
            currentExtent = [
                205000,
                5009000,
                730000
            ];
            expect(model.getIfInExtent(capability, currentExtent)).to.be.true;
        });

        it("should return true if the currentExtent is not in the right format", function () {
            currentExtent = "";
            expect(model.getIfInExtent(capability, currentExtent)).to.be.true;
        });

        it("should return true if the layer in Capability does not have the right crs", function () {
            capability = {
                Capability: {
                    Layer: {
                        "BoundingBox": [
                            {
                                "crs": "EPSG:3067",
                                "extent": [
                                    336385.4535501953,
                                    6628495.2621008465,
                                    447592.181149918,
                                    7646073.290737241
                                ]
                            }
                        ]
                    }
                }
            };
            currentExtent = [
                455000,
                5809000,
                730000,
                6075800
            ];
            expect(model.getIfInExtent(capability, currentExtent)).to.be.true;
        });

        it("should return true if the layer in Capability does not have the right extent", function () {
            capability = {
                Capability: {
                    Layer: {
                        "BoundingBox": [
                            {
                                "crs": "EPSG:25832",
                                "extent": [
                                    302907.887193,
                                    5435104.982326,
                                    389523.673913
                                ]
                            }
                        ]
                    }
                }
            };
            currentExtent = [
                455000,
                5809000,
                730000,
                6075800
            ];
            expect(model.getIfInExtent(capability, currentExtent)).to.be.true;
        });
    });
});
