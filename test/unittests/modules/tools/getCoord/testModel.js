import {expect} from "chai";
import Model from "@modules/tools/getCoord/model.js";

var position1 = [564337.37, 5935980.05],
    position2 = [586519.54, 5935688.88],
    model;

before(function () {
    model = new Model();
});

describe("getCoordModel", function () {
    describe("functions for positioning", function () {
        it("checkPosition sets attributes", function () {
            model.checkPosition(position1);
            expect(model.get("positionMapProjection")[0]).to.equal(564337.37);
            expect(model.get("positionMapProjection")[1]).to.equal(5935980.05);
        });
        it("positionClicked sets attributes", function () {
            model.positionClicked(position2);
            expect(model.get("positionMapProjection")[0]).to.equal(586519.54);
            expect(model.get("positionMapProjection")[1]).to.equal(5935688.88);
            expect(model.get("updatePosition")).to.equal(false);
        });
        it("after positionClicked checkPosition does not set attributes", function () {
            model.checkPosition(position1);
            expect(model.get("positionMapProjection")[0]).to.equal(586519.54);
            expect(model.get("positionMapProjection")[1]).to.equal(5935688.88);
        });
    });
    describe("functions for formating coordinates", function () {
        it("should return HDMS format", function () {
            expect(model.getHDMS(position1)).to.equal("59° 57′ 01″ S 142° 37′ 49″ W");
        });
        it("should return cartesian format", function () {
            expect(model.getCartesian(position1)).to.equal("564337.37, 5935980.05");
        });
    });
});
