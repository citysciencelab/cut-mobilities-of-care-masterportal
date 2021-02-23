import {expect} from "chai";
import convertJsonToPost from "../../convertJsonToPost.js";

describe("src/utils/convertJsonToPost.js", () => {
    describe("convertJsonToPost", () => {
        it("should return the given input as its string representation if no array nor object is given", () => {
            expect(convertJsonToPost(undefined)).to.equal("undefined");
            expect(convertJsonToPost(null)).to.equal("null");
            expect(convertJsonToPost(1234)).to.equal("1234");
            expect(convertJsonToPost("test")).to.equal("test");
            expect(convertJsonToPost(false)).to.equal("false");
            expect(convertJsonToPost(true)).to.equal("true");
        });
        it("should convert an empty array or object into an empty string", () => {
            expect(convertJsonToPost([])).to.equal("");
            expect(convertJsonToPost({})).to.equal("");
        });
        it("should convert an array into the expected raw data scheme", () => {
            expect(convertJsonToPost([true])).to.equal("0=true");
        });
        it("should convert an object into the expected raw data scheme", () => {
            expect(convertJsonToPost({0: true})).to.equal("0=true");
        });
        it("should format key and value of the given input to be uri conform", () => {
            expect(convertJsonToPost({"ä": "ö"})).to.equal("%C3%A4=%C3%B6");
        });
        it("should convert a complex structure into the expected raw data scheme", () => {
            const input = {
                    from: ["from1@example.com", "from2@example.com"],
                    to: {
                        email: "to@example.com",
                        name: "test name"
                    },
                    subject: "!\"§$%&/()=üäö"
                },
                expected = "from%5B0%5D=from1%40example.com&from%5B1%5D=from2%40example.com&to%5Bemail%5D=to%40example.com&to%5Bname%5D=test%20name&subject=!%22%C2%A7%24%25%26%2F()%3D%C3%BC%C3%A4%C3%B6";

            expect(convertJsonToPost(input)).to.equal(expected);
        });
    });
});
