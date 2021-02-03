import {expect} from "chai";
import getters from "../../../store/gettersContact.js";
import {minMessageLength} from "../../../store/constantsContact.js";

const {
    validForm,
    validMail,
    validMessage,
    validPhone,
    validUsername
} = getters;

describe("tools/contact/store/gettersContact", function () {
    describe("validMessage", function () {
        it("confirms validity when message has or exceeds minMessageLength", function () {
            expect(validMessage(
                {message: String().padStart(minMessageLength, "x")}
            )).to.be.true;
            expect(validMessage(
                {message: String().padStart(minMessageLength + 1, "x")}
            )).to.be.true;
            expect(validMessage(
                {message: String().padStart(minMessageLength - 1, "x")}
            )).to.be.false;
        });
    });
});
