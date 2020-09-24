import {expect} from "chai";
import {isPhoneNumber, getPhoneNumberAsWebLink, isPhoneNumberBasic} from "../../isPhoneNumber.js";

describe("src/utils/isPhoneNumber.js", () => {
    describe("isPhoneNumber", () => {
        it("should not match anything but a string or a number", () => {
            expect(isPhoneNumber(undefined)).to.be.false;
            expect(isPhoneNumber(null)).to.be.false;
            expect(isPhoneNumber(true)).to.be.false;
            expect(isPhoneNumber(false)).to.be.false;
            expect(isPhoneNumber([])).to.be.false;
            expect(isPhoneNumber({})).to.be.false;
        });
        it("should not match an empty string", () => {
            expect(isPhoneNumber("")).to.be.false;
        });
        it("should not pass any alphabetic letter", () => {
            expect(isPhoneNumber("123x456")).to.be.false;
        });

        it("should recognize a phone number starting with +", () => {
            expect(isPhoneNumber("+49123456789")).to.be.true;
        });
    });
    describe("isPhoneNumberBasic", () => {
        it("should not match anything but a string or a number", () => {
            expect(isPhoneNumberBasic(undefined)).to.be.false;
            expect(isPhoneNumberBasic(null)).to.be.false;
            expect(isPhoneNumberBasic(true)).to.be.false;
            expect(isPhoneNumberBasic(false)).to.be.false;
            expect(isPhoneNumberBasic([])).to.be.false;
            expect(isPhoneNumberBasic({})).to.be.false;
        });
        it("should not match an empty string", () => {
            expect(isPhoneNumberBasic("")).to.be.false;
        });
        it("should not pass any alphabetic letter", () => {
            expect(isPhoneNumberBasic("123x456")).to.be.false;
        });
        it("should not pass any special signs, other than spaces, hyphen, brackets, dots and backspaces", () => {
            expect(isPhoneNumberBasic("123!456")).to.be.false;
            expect(isPhoneNumberBasic("123?456")).to.be.false;
            expect(isPhoneNumberBasic("123§456")).to.be.false;
            expect(isPhoneNumberBasic("123$456")).to.be.false;
            expect(isPhoneNumberBasic("123&456")).to.be.false;
            expect(isPhoneNumberBasic("123'456")).to.be.false;
            expect(isPhoneNumberBasic("123#456")).to.be.false;
            expect(isPhoneNumberBasic("123;456")).to.be.false;
            expect(isPhoneNumberBasic("123,456")).to.be.false;
            expect(isPhoneNumberBasic("123:456")).to.be.false;
            expect(isPhoneNumberBasic("123ß456")).to.be.false;
            // thats enough.
        });

        it("should recognize a phone number starting with and without +", () => {
            expect(isPhoneNumberBasic("+49123456789")).to.be.true;
            expect(isPhoneNumberBasic("49123456789")).to.be.true;
        });
        it("should recognize a phone number with a country code in brackets - with and without +", () => {
            expect(isPhoneNumberBasic("+(49)123456789")).to.be.true;
            expect(isPhoneNumberBasic("(49)123456789")).to.be.true;
        });
        it("should recognize a phone number with one or many hyphens", () => {
            expect(isPhoneNumberBasic("123-456")).to.be.true;
            expect(isPhoneNumberBasic("1-2-3-4-5-6-7-8-9")).to.be.true;
        });
        it("should recognize a phone number with one or many spaces", () => {
            expect(isPhoneNumberBasic("123 456")).to.be.true;
            expect(isPhoneNumberBasic("1 2 3 4 5 6 7 8 9")).to.be.true;
        });
        it("should recognize a phone number with one or many dots", () => {
            expect(isPhoneNumberBasic("123.456")).to.be.true;
            expect(isPhoneNumberBasic("1.2.3.4.5.6.7.8.9")).to.be.true;
        });
        it("should recognize a phone number with one or many backspaces", () => {
            expect(isPhoneNumberBasic("123/456")).to.be.true;
            expect(isPhoneNumberBasic("1/2/3/4/5/6/7/8/9")).to.be.true;
        });
        it("should pass the above all together", () => {
            expect(isPhoneNumberBasic("+(12)3-4 5.6/7")).to.be.true;
        });
    });

    describe("getPhoneNumberAsWebLink", () => {
        it("should return a prefixed string (by default with 'tel:') no matter what kind of input is given", () => {
            // this is reasonable, as the phone number shall be checked with isPhoneNumber first
            expect(getPhoneNumberAsWebLink(undefined)).to.equal("tel:undefined");
            expect(getPhoneNumberAsWebLink(null)).to.equal("tel:null");
            expect(getPhoneNumberAsWebLink(1234)).to.equal("tel:1234");
            expect(getPhoneNumberAsWebLink("string")).to.equal("tel:string");
            expect(getPhoneNumberAsWebLink({})).to.equal("tel:[objectObject]");
            expect(getPhoneNumberAsWebLink([])).to.equal("tel:");
            expect(getPhoneNumberAsWebLink(false)).to.equal("tel:false");
            expect(getPhoneNumberAsWebLink(true)).to.equal("tel:true");
        });

        it("should alter the prefix based on the second argument", () => {
            expect(getPhoneNumberAsWebLink("phonenumber", "prefix")).to.equal("prefixphonenumber");
        });
        it("should replace spaces, hyphen, brackets, dots and backspaces from the given phone number", () => {
            expect(getPhoneNumberAsWebLink("p h o-n-e(n(u)m)b.e.r/t/est")).to.equal("tel:phonenumbertest");
        });
    });
});
