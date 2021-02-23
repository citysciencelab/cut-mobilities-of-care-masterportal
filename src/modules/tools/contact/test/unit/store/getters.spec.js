import {expect} from "chai";
import {minMessageLength} from "../../../store/constantsContact.js";
import getters from "../../../store/gettersContact.js";

const {
    validForm,
    validMail,
    validMessage,
    validPhone,
    validUsername
} = getters;

describe("tools/contact/store/gettersContact", function () {
    describe("validMessage", function () {
        it("confirms valid messages", function () {
            expect(validMessage({message: String().padStart(minMessageLength, "x")})).to.be.true;
            expect(validMessage({message: String().padStart(minMessageLength + 1, "x")})).to.be.true;
            expect(validMessage({message: String().padStart(minMessageLength - 1, "x")})).to.be.false;
        });
    });

    describe("validPhone", function () {
        it("confirms valid phone numbers", function () {
            expect(validPhone({phone: "(040) 11 - 5"})).to.be.true;
            expect(validPhone({phone: "+49 40 115"})).to.be.true;
            expect(validPhone({phone: "555-COME-ON-NOW"})).to.be.false;
        });
    });

    describe("validUsername", function () {
        it("confirms valid usernames", function () {
            /* Currently considering accepting valid names more valuable than blocking
             * emojis since even with restrictions on, people may easily enter passing
             * garbage by repeatedly hitting their keyboard anyway.
             */

            // positive
            expect(validUsername({username: "Hans Hansen"})).to.be.true;
            expect(validUsername({username: "José"})).to.be.true;
            expect(validUsername({username: "Janice Keihanaikukauakahihulihe'ekahaunaele"})).to.be.true;
            expect(validUsername({username: "Peter Jr."})).to.be.true;
            expect(validUsername({username: "Руслан"})).to.be.true;
            expect(validUsername({username: "王"})).to.be.true;
            expect(validUsername({username: "Nguyễn Tấn Dũng"})).to.be.true;

            // negative
            // expect(validUsername({username: "(040) 11 - 5"})).to.be.false;
            // expect(validUsername({username: "gregor@example.com"})).to.be.false;
            // expect(validUsername({username: "😏🐧"})).to.be.false;
        });
    });

    describe("validMail", function () {
        it("confirms valid mails", function () {
            /* https://gist.github.com/cjaoude/fd9910626629b53c4d25 ok
             * All positive tests are used. Negative tests are mostly ignored since
             * allowing valid adresses is more important than stopping weird invalid ones.
             * Still better than using the perfect regex on each keyup I'd assume:
             * http://www.ex-parrot.com/pdw/Mail-RFC822-Address.html */

            // positive
            expect(validMail({mail: "email@example.com"})).to.be.true;
            expect(validMail({mail: "firstname.lastname@example.com"})).to.be.true;
            expect(validMail({mail: "email@subdomain.example.com"})).to.be.true;
            expect(validMail({mail: "firstname+lastname@example.com"})).to.be.true;
            expect(validMail({mail: "email@123.123.123.123"})).to.be.true;
            expect(validMail({mail: "email@[123.123.123.123]"})).to.be.true;
            expect(validMail({mail: "\"email\"@example.com"})).to.be.true;
            expect(validMail({mail: "1234567890@example.com"})).to.be.true;
            expect(validMail({mail: "email@example-one.com"})).to.be.true;
            expect(validMail({mail: "_______@example.com"})).to.be.true;
            expect(validMail({mail: "email@example.name"})).to.be.true;
            expect(validMail({mail: "email@example.museum"})).to.be.true;
            expect(validMail({mail: "email@example.co.jp"})).to.be.true;
            expect(validMail({mail: "firstname-lastname@example.com"})).to.be.true;
            expect(validMail({mail: "much.”more unusual”@example.com"})).to.be.true;
            expect(validMail({mail: "very.unusual.”@”.unusual.com@example.com"})).to.be.true;
            expect(validMail({mail: "very.”(),:;<>[]”.VERY.”very@\\\\ \"very”\\.unusual@strange.example.com"})).to.be.true;

            // negative
            expect(validMail({mail: "plainaddress"})).to.be.false;
            expect(validMail({mail: "@example.com"})).to.be.false;
            expect(validMail({mail: "email.example.com"})).to.be.false;
            expect(validMail({mail: "email@example"})).to.be.false;
        });
    });

    describe("validForm", function () {
        it("returns true for valid privacy policy scenarios", function () {
            const state = {
                    showPrivacyPolicy: true,
                    privacyPolicyAccepted: true
                },
                testGetters = {
                    validMail: true,
                    validMessage: true,
                    validPhone: true,
                    validUsername: true
                };

            expect(validForm(state, testGetters)).to.be.true;
            state.showPrivacyPolicy = false;
            expect(validForm(state, testGetters)).to.be.true;
            state.privacyPolicyAccepted = false;
            expect(validForm(state, testGetters)).to.be.true;
        });

        it("returns false for invalid privacy policy scenario", function () {
            const state = {
                    showPrivacyPolicy: true,
                    privacyPolicyAccepted: false
                },
                testGetters = {
                    validMail: true,
                    validMessage: true,
                    validPhone: true,
                    validUsername: true
                };

            expect(validForm(state, testGetters)).to.be.false;
        });
    });
});
