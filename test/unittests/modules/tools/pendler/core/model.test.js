import Model from "@modules/tools/pendler/core/model.js";
import {expect} from "chai";

let model;

describe("modules/tools/pendler/core/model.js", () => {
    beforeEach(() => {
        model = new Model();
    });

    describe("mutateFeatureTypeForSingleCounties", () => {
        it("should return the value of featureType if singleCounties is anything but an array", () => {
            const county = "County",
                featureType = "featureType",
                wfsappKreise = "something other than featureType",
                wfsappGemeinde = "should have no effect",
                expected = "featureType";

            expect(model.mutateFeatureTypeForSingleCounties(county, undefined, featureType, wfsappKreise, wfsappGemeinde)).to.equal(expected);
            expect(model.mutateFeatureTypeForSingleCounties(county, null, featureType, wfsappKreise, wfsappGemeinde)).to.equal(expected);
            expect(model.mutateFeatureTypeForSingleCounties(county, "string", featureType, wfsappKreise, wfsappGemeinde)).to.equal(expected);
            expect(model.mutateFeatureTypeForSingleCounties(county, 1234, featureType, wfsappKreise, wfsappGemeinde)).to.equal(expected);
            expect(model.mutateFeatureTypeForSingleCounties(county, true, featureType, wfsappKreise, wfsappGemeinde)).to.equal(expected);
            expect(model.mutateFeatureTypeForSingleCounties(county, {}, featureType, wfsappKreise, wfsappGemeinde)).to.equal(expected);
        });

        it("should return the value of featureType if featureType does not equal wfsappKreise", () => {
            const county = "County",
                singleCounties = [
                    "County"
                ],
                featureType = "featureType",
                wfsappKreise = "something other than featureType",
                wfsappGemeinde = "should have no effect",
                result = model.mutateFeatureTypeForSingleCounties(county, singleCounties, featureType, wfsappKreise, wfsappGemeinde),
                expected = "featureType";

            expect(result).to.equal(expected);
        });
        it("should return the value of featureType if featureType equals wfsappKreise and county can't be found in the singleCounties list", () => {
            const county = "County",
                singleCounties = [
                    "NotTheCounty"
                ],
                featureType = "featureType equals wfsappKreise",
                wfsappKreise = "featureType equals wfsappKreise",
                wfsappGemeinde = "should have no effect",
                result = model.mutateFeatureTypeForSingleCounties(county, singleCounties, featureType, wfsappKreise, wfsappGemeinde),
                expected = "featureType equals wfsappKreise";

            expect(result).to.equal(expected);
        });
        it("should return the value of wfsappGemeinde if featureType equals wfsappKreise and county is found in the singleCounties list", () => {
            const county = "County",
                singleCounties = [
                    "County"
                ],
                featureType = "featureType equals wfsappKreise",
                wfsappKreise = "featureType equals wfsappKreise",
                wfsappGemeinde = "expected value is wfsappGemeinde",
                result = model.mutateFeatureTypeForSingleCounties(county, singleCounties, featureType, wfsappKreise, wfsappGemeinde),
                expected = "expected value is wfsappGemeinde";

            expect(result).to.equal(expected);
        });
    });
});
