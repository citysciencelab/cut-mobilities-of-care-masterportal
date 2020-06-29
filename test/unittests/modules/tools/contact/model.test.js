import Model from "@modules/tools/contact/model.js";
import sinon from "sinon";
import {expect} from "chai";

describe("contact/model", function () {
    let model;

    const testAttrEmail = {
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

    afterEach(sinon.restore);

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
    describe("send", function () {
        it("sends a mail with entered information and triggers an alert", function () {
            const ajax = sinon.fake(({success}) => success.call({get: x => x}, {})),
                trigger = sinon.fake(),
                name = "Jean-Luc Picard",
                mail = "best_captain@example.com",
                tel = "55555555",
                text = "It is possible to commit no mistakes and still lose. That is not weakness, that is a merge conflict.";

            sinon.stub(Radio, "request").callsFake(() => ({get: x => x}));
            sinon.stub(Radio, "trigger").callsFake(trigger);
            sinon.stub($, "ajax").callsFake(ajax);

            model = new Model();

            model.setUserName(name);
            model.setUserEmail(mail);
            model.setUserTel(tel);
            model.setText(text);

            model.send();

            expect(ajax.called).to.be.true;
            expect(JSON.stringify(ajax.args[0][0].data.text))
                .to.contain(name)
                .and.to.contain(mail)
                .and.to.contain(tel)
                .and.to.contain(text);

            expect(trigger.called).to.be.true;
            expect(trigger.calledWith("Alert", "alert")).to.be.true;
        });
    });
});
