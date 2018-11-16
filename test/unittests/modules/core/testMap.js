import {expect} from "chai";
import Model from "@modules/core/map.js";
import Util from "@testUtil";
import Preparser from "@modules/core/configLoader/preparser";
import ParametricURL from "@modules/core/parametricURL";

describe("core/map", function () {
    var model,
        utilModel,
        features;

    before(function () {
        new Preparser();
        new ParametricURL();
        model = new Model();
        utilModel = new Util();
        features = utilModel.createTestFeatures("resources/testFeatures.xml");
    });

    describe("calculateExtent", function () {
        it("should return extent that is not undefined", function () {
            expect(model.calculateExtent(features)).not.to.be.undefined;
        });
        it("should return extent of test-features with xMin = 547858.468", function () {
            expect(model.calculateExtent(features)[0]).to.equal(547858.468);
        });
        it("should return extent of test-features with yMin = 5924016.116", function () {
            expect(model.calculateExtent(features)[1]).to.equal(5924016.116);
        });
        it("should return extent of test-features with xMax = 584635.381", function () {
            expect(model.calculateExtent(features)[2]).to.equal(584635.381);
        });
        it("should return extent of test-features with yMax = 5984174.061", function () {
            expect(model.calculateExtent(features)[3]).to.equal(5984174.061);
        });

        describe("getMapMode", function () {
            it("should return 2D", function () {
                expect(model.getMapMode()).to.equal("2D");
            });
        });
    });
});
