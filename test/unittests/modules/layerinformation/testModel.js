define(function (require) {
    var expect = require("chai").expect,
        LayerInfoModel = require("../../../../modules/layerinformation/model.js");

    describe("Layerinformation", function () {
        var model;

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
    });
});
