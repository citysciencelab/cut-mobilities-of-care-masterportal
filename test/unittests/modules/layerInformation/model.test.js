import LayerInfoModel from "@modules/layerInformation/model.js";
import {expect} from "chai";

describe("LayerInformation", function () {
    let model;

    before(function () {
        model = new LayerInfoModel();
    });

    describe("isOwnMetaRequest", function () {
        it("should return true if uniqueId is in uniqueIdList", function () {
            expect(model.isOwnMetaRequest(["1234", "5678"], "1234")).to.be.true;
        });
        it("should return false if uniqueId is NOT in uniqueIdList", function () {
            expect(model.isOwnMetaRequest(["1234", "5678"], "91011")).to.be.false;
        });
        it("should return false if uniqueId is undefined", function () {
            expect(model.isOwnMetaRequest(["1234", "5678"], undefined)).to.be.false;
        });
        it("should return false if uniqueIdList is undefined", function () {
            expect(model.isOwnMetaRequest(undefined, "91011")).to.be.false;
        });
        it("should return false if uniqueIdList and uniqueId is undefined", function () {
            expect(model.isOwnMetaRequest(undefined, undefined)).to.be.false;
        });
    });
    describe("removeUniqueIdFromList", function () {
        it("should remove uniqueId from uniqueIdList if uniqueId in uniqueIdList", function () {
            model.removeUniqueIdFromList(["1234", "5678"], "1234");
            expect(model.get("uniqueIdList")).to.deep.equal(["5678"]);
        });
        it("should leave uniqueIdList if uniqueId not in uniqueIdList", function () {
            model.removeUniqueIdFromList(["1234", "5678"], "123456789");
            expect(model.get("uniqueIdList")).to.deep.equal(["1234", "5678"]);
        });
        it("should leave uniqueIdList if uniqueId is undefined", function () {
            model.removeUniqueIdFromList(["1234", "5678"], undefined);
            expect(model.get("uniqueIdList")).to.deep.equal(["1234", "5678"]);
        });
        it("should leave uniqueIdList if uniqueIdList is undefined", function () {
            model.removeUniqueIdFromList(undefined, "5678");
            expect(model.get("uniqueIdList")).to.be.an("array").that.is.empty;
        });
        it("should leave uniqueIdList if uniqueIdList and uniqueId is undefined", function () {
            model.removeUniqueIdFromList(undefined, undefined);
            expect(model.get("uniqueIdList")).to.be.an("array").that.is.empty;
        });
    });
    describe("areMetaIdsSet", function () {
        it("checks if metaIds are undefined", function () {
            expect(model.areMetaIdsSet(undefined)).to.be.false;
        });
        it("checks if metaIds are null", function () {
            expect(model.areMetaIdsSet(null)).to.be.false;
        });
        it("checks if metaIds are an empty array", function () {
            expect(model.areMetaIdsSet([])).to.be.false;
        });
        it("checks if metaIds are array with null", function () {
            expect(model.areMetaIdsSet([null])).to.be.false;
        });
        it("checks if metaIds are arrray with undefined", function () {
            expect(model.areMetaIdsSet([undefined])).to.be.false;
        });
        it("checks if metaIds are array with empty string", function () {
            expect(model.areMetaIdsSet([""])).to.be.false;
        });
        it("checks if metaIds are set correctly", function () {
            expect(model.areMetaIdsSet(["7A77D5EA-C3B4-44D9-8004-36D5D324485D"])).to.be.true;
        });
        it("checks if 2 metaIds are set correctly", function () {
            expect(model.areMetaIdsSet(["7A77D5EA-C3B4-44D9-8004-36D5D324485D", "456"])).to.be.true;
        });
    });
});
