import {expect} from "chai";
import beautifyKey from "../../beautifyKey.js";

describe("src/utils/beautifyKey.js", () => {
    describe("beautifyKey", () => {
        it("should return a string no matter what no-string input is given", () => {
            expect(beautifyKey(undefined)).to.be.a("string").and.to.be.empty;
            expect(beautifyKey(null)).to.be.a("string").and.to.be.empty;
            expect(beautifyKey(1234)).to.be.a("string").and.to.be.empty;
            expect(beautifyKey({})).to.be.a("string").and.to.be.empty;
            expect(beautifyKey([])).to.be.a("string").and.to.be.empty;
            expect(beautifyKey(false)).to.be.a("string").and.to.be.empty;
            expect(beautifyKey(true)).to.be.a("string").and.to.be.empty;
        });
        it("should uppercase the first letter (by default) and replace all underscore with a space character (by default)", () => {
            expect(beautifyKey("beautify_string")).to.equal("Beautify string");
        });
        it("should not uppercase the first letter if the given option tells it so", () => {
            expect(beautifyKey("beautify_string", {
                uppercase: false
            })).to.equal("beautify string");
        });
        it("should replace all replacements given by options", () => {
            expect(beautifyKey("beautify_string", {
                replacements: {
                    "_": " ",
                    "i": "ABC"
                }
            })).to.equal("BeautABCfy strABCng");
        });
    });
});
