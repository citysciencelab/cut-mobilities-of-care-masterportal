import {expect} from "chai";
import actions from "../../../actions";

const singleDeprecatedEntryCase1 = ["Portalconfig.portalTitle.title", ["Portalconfig.PortalTitle"]],
    singleDeprecatedEntryCase2 = ["Portalconfig.treeType", ["Portalconfig.Baumtyp"]],
    singleDeprecatedEntryCase3 = ["Portalconfig.portalTitle.toolTip", ["Portalconfig.LogoToolTip", "Portalconfig.portalTitle.tooltip"]],

    configCase1 = {
        Portalconfig: {
            PortalTitle: "Testname",
            PortalLogo: "Testlink.de",
            LogoLink: "Testlogo",
            LogoToolTip: "TTT = Test-Tool-Tip"
        }
    },
    configCase2 = {
        Portalconfig: {
            portalTitle: {
                title: "Testname",
                logo: "Testlink.de",
                link: "Testlogo",
                tooltip: "TTT = Test-Tool-Tip"
            }
        }
    },
    configCase3 = {
        Portalconfig: {
            PortalTitle: "Testname",
            PortalLogo: "Testlink.de",
            LogoLink: "Testlogo",
            LogoToolTip: "TTT = Test-Tool-Tip"
        }
    },

    parametersCase1 = {
        "newSplittedPath": ["Portalconfig", "portalTitle", "title"],
        "oldSplittedPath": ["Portalconfig", "PortalTitle"],
        "output": "Testname",
        "deprecatedKey": "PortalTitle"
    },
    parametersCase2 = {
        "newSplittedPath": ["Portalconfig", "treeType"],
        "oldSplittedPath": ["Portalconfig", "Baumtyp"],
        "output": undefined,
        "deprecatedKey": "Baumtyp"
    };

describe("getDeprecatedParameters", function () {
    it("should return an object with the correct defined parameters: newSplittedPath, oldSplittedPath, output, deprecatedKey.", function () {
        const configCopy = {...configCase1},
            testReturn = actions.getDeprecatedParameters(singleDeprecatedEntryCase1, configCopy);

        expect(testReturn).to.be.an("Object");
        expect(testReturn.newSplittedPath).to.deep.equal(["Portalconfig", "portalTitle", "title"]);
        expect(testReturn.oldSplittedPath).to.deep.equal(["Portalconfig", "PortalTitle"]);
        expect(testReturn.output).to.equal("Testname");
        expect(testReturn.deprecatedKey).to.equal("PortalTitle");
    });

    it("should return undefined.", function () {
        const configCopy = {...configCase1},
            testReturn = actions.getDeprecatedParameters(singleDeprecatedEntryCase2, configCopy);

        expect(testReturn).to.be.undefined;
    });
    it("should return an object with defined parameters", function () {
        const configCopy = {...configCase2},
            testReturn = actions.getDeprecatedParameters(singleDeprecatedEntryCase3, configCopy);

        expect(testReturn).to.be.an("Object");
        expect(testReturn.newSplittedPath).to.deep.equal(["Portalconfig", "portalTitle", "toolTip"]);
        expect(testReturn.oldSplittedPath).to.deep.equal(["Portalconfig", "portalTitle", "tooltip"]);
        expect(testReturn.output).to.equal("TTT = Test-Tool-Tip");
        expect(testReturn.deprecatedKey).to.equal("tooltip");
    });
    it("should return an object with defined parameters", function () {
        const configCopy = {...configCase1},
            testReturn = actions.getDeprecatedParameters(singleDeprecatedEntryCase3, configCopy);

        expect(testReturn).to.be.an("Object");
        expect(testReturn.newSplittedPath).to.deep.equal(["Portalconfig", "portalTitle", "toolTip"]);
        expect(testReturn.oldSplittedPath).to.deep.equal(["Portalconfig", "LogoToolTip"]);
        expect(testReturn.output).to.equal("TTT = Test-Tool-Tip");
        expect(testReturn.deprecatedKey).to.equal("LogoToolTip");
    });
});
describe("replaceDeprecatedCode", function () {
    it("should return an updated config with replaced deprecated parameters", function () {
        const configCopy = {...configCase1},
            testReturn = actions.replaceDeprecatedCode(parametersCase1, configCopy);

        expect(testReturn).to.be.an("Object");
        expect(testReturn.Portalconfig.portalTitle.title).to.equal("Testname");
        expect(testReturn.Portalconfig.PortalTitle).to.be.undefined;
    });
    it("should return an unchanged object compared to the transferred config", function () {
        const configCopy = {...configCase3},
            testReturn = actions.replaceDeprecatedCode(parametersCase2, configCopy);

        expect(testReturn).to.deep.equal(configCopy);
    });
});
