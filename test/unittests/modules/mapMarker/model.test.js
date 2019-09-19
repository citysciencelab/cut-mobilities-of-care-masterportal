import MapMarkerModel from "@modules/mapMarker/model.js";
import {expect} from "chai";

describe("mapMarker/model", function () {
    var mapMarkerModel;

    before(function () {
        mapMarkerModel = new MapMarkerModel();
    });

    describe("convertCoordinatesToInteger", function () {
        it("should return an empty array by undefined input", function () {
            expect(mapMarkerModel.convertCoordinatesToInteger(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an array with integers by string with brackets input", function () {
            expect(mapMarkerModel.convertCoordinatesToInteger(["123)", "345"])).to.be.an("array")
                .that.includes(123, 345);
        });
        it("should return an array with integers by string without input", function () {
            expect(mapMarkerModel.convertCoordinatesToInteger(["123", "345"])).to.be.an("array")
                .that.includes(123, 345);
        });
        it("should return an array with integers by integer input", function () {
            expect(mapMarkerModel.convertCoordinatesToInteger(["123", "345"])).to.be.an("array")
                .that.includes(123, 345);
        });
        it("should return an empty array by empty array input", function () {
            expect(mapMarkerModel.convertCoordinatesToInteger([])).to.be.an("array").that.is.empty;
        });
    });
});
