import MapMarkerModel from "@modules/mapMarker/model.js";
import {expect} from "chai";

describe("mapMarker/model", function () {
    var mapMarkerModel;

    before(function () {
        mapMarkerModel = new MapMarkerModel();
    });

    describe("convertCoordinatesToFloat", function () {
        it("should return an empty array by undefined input", function () {
            expect(mapMarkerModel.convertCoordinatesToFloat(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an array with floats by string with brackets input", function () {
            expect(mapMarkerModel.convertCoordinatesToFloat(["123.1)", "345.2("])).to.be.an("array")
                .that.includes(123.1, 345.2);
        });
        it("should return an array with floats by string without input", function () {
            expect(mapMarkerModel.convertCoordinatesToFloat(["123.1", "345.2"])).to.be.an("array")
                .that.includes(123.1, 345.2);
        });
        it("should return an array with floats by float input", function () {
            expect(mapMarkerModel.convertCoordinatesToFloat([123.345, 345.123])).to.be.an("array")
                .that.includes(123.345, 345.123);
        });
        it("should return an empty array by empty array input", function () {
            expect(mapMarkerModel.convertCoordinatesToFloat([])).to.be.an("array").that.is.empty;
        });
    });
});
