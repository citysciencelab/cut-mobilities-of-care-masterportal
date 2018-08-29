define(function (require) {
    var expect = require("chai").expect,
        PrintModel = require("../../../../../modules/tools/print_/buildSpec.js"),
        model;

    before(function () {
        model = new PrintModel();
    });

    describe("tools/print_/buildSpec", function () {
        describe("parseAddress", function () {
            it("should return empty string if all keys in address object are empty", function () {
                var address = {
                    street: "",
                    housenr: "",
                    postalCode: "",
                    city: ""
                };

                expect(model.parseAddress(address)).to.be.a("string").that.is.empty;
            });
            it("should return empty address object is empty", function () {
                expect(model.parseAddress({})).to.be.a("string").that.is.empty;
            });
            it("should return empty address object is undefined", function () {
                expect(model.parseAddress(undefined)).to.be.a("string").that.is.empty;
            });
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
    });
});
