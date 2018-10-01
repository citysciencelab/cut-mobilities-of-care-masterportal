import {expect} from "chai";
import Model from "@modules/contact/model.js";


describe("contact/model", function () {
    var model,
        testAttrEmail = {
            target: {
                id: "contactEmail",
                value: "Test.test@test.de"
            }
        },
        testAttrName = {
            target: {
                id: "contactName",
                value: "LGV Geodatenanwendungen"
            }
        },
        testAttrTel = {
            target: {
                id: "contactTel",
                value: "123456"
            }
        },
        testAttrText = {
            target: {
                id: "contactText",
                value: "Hier sollte das Anliegen stehen"
            }
        };

    before(function () {

    });

    describe("setUserAttributes", function () {
        it("should return true when attribute email length > 1 and matches the regex", function () {
            model = new Model();
            model.setUserAttributes(testAttrEmail);
            model.isValid();
            expect(model.validationError.userEmail).to.be.true;
        });
        it("should return true when attribute name length is > 3", function () {
            model = new Model();
            model.setUserAttributes(testAttrName);
            model.isValid();
            expect(model.validationError.userName).to.be.true;
        });
        it("should return true when attribute tel matches the regex ", function () {
            model = new Model();
            model.setUserAttributes(testAttrTel);
            model.isValid();
            expect(model.validationError.userTel).to.be.true;
        });
        it("should return true when attribute text is > 10 signs", function () {
            model = new Model();
            model.setUserAttributes(testAttrText);
            model.isValid();
            expect(model.validationError.text).to.be.true;
        });
    });
    describe("validate", function () {
        it("should return object equal to the given object", function () {
            model = new Model();
            model.isValid();
            expect(model.validationError).to.deep.equal({userName: false, userEmail: false, userTel: false, text: false});
        });
        it("should return true when all attributes are set and valid", function () {
            model = new Model();
            model.setUserAttributes(testAttrEmail);
            model.setUserAttributes(testAttrName);
            model.setUserAttributes(testAttrTel);
            model.setUserAttributes(testAttrText);
            model.isValid();
            expect(model.validationError).to.be.true;
        });
    });
});
