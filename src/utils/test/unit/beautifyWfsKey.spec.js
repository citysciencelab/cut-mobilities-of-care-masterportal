import {expect} from "chai";
import beautifyWfsKey from "../../beautifyWfsKey.js";

describe("src/utils/beautifyWfsKey.js", () => {
    describe("beautifyWfsKey", () => {
        it("should return a string no matter what no-string input is given", () => {
            expect(beautifyWfsKey(undefined)).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKey(null)).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKey(1234)).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKey({})).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKey([])).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKey(false)).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKey(true)).to.be.a("string").and.to.be.empty;
        });
        it("should uppercase the first letter (by default) and replace all underscore with a space character (by default)", () => {
            expect(beautifyWfsKey("beautify_string")).to.equal("Beautify string");
        });
        it("should not uppercase the first letter if the given option tells it so", () => {
            expect(beautifyWfsKey("beautify_string", {
                uppercase: false
            })).to.equal("beautify string");
        });
        it("should replace all replacements given by options", () => {
            expect(beautifyWfsKey("beautify_string", {
                replacements: {
                    "_": " ",
                    "i": "ABC"
                }
            })).to.equal("BeautABCfy strABCng");
        });
    });
});
