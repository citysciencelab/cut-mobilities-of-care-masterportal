import {expect} from "chai";
import beautifyWfsKeys from "../../beautifyWfsKeys.js";

describe("src/utils/beautifyWfsKeys.js", () => {
    describe("beautifyWfsKeys", () => {
        it("should return a string no matter what no-string input is given", () => {
            expect(beautifyWfsKeys(undefined)).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKeys(null)).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKeys(1234)).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKeys({})).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKeys([])).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKeys(false)).to.be.a("string").and.to.be.empty;
            expect(beautifyWfsKeys(true)).to.be.a("string").and.to.be.empty;
        });
        it("should uppercase the first letter (by default) and replace all underscore with a space character (by default)", () => {
            expect(beautifyWfsKeys("beautify_string")).to.equal("Beautify string");
        });
        it("should not uppercase the first letter if the given option tells it so", () => {
            expect(beautifyWfsKeys("beautify_string", {
                uppercase: false
            })).to.equal("beautify string");
        });
        it("should replace all replacements given by options", () => {
            expect(beautifyWfsKeys("beautify_string", {
                replacements: {
                    "_": " ",
                    "i": "ABC"
                }
            })).to.equal("BeautABCfy strABCng");
        });
    });
});
