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

    describe("getIfInExtent", function () {
        const capability = {
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
        };
        let currentExtent = [];

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
    });
});
