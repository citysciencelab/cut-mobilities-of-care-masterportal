import {expect} from "chai";
import mutations from "../../../mutations";

describe("src/app-store/mutations.js", () => {
    describe("setConfigJson", () => {
        it("it should return an object with the correct keys and values", () => {
            const config = {
                    Portalconfig: {
                        PortalTitle: "Testname",
                        PortalLogo: "Testlink.de",
                        LogoLink: "Testlogo",
                        LogoToolTip: "TTT = Test-Tool-Tip"
                    }
                },
                state = {};

            mutations.setConfigJson(state, config);

            expect(state.configJson.Portalconfig.portalTitle).to.be.an("Object");
            expect(state.configJson.Portalconfig.portalTitle.title).to.equal("Testname");
            expect(state.configJson.Portalconfig.portalTitle.logo).to.equal("Testlink.de");
            expect(state.configJson.Portalconfig.portalTitle.link).to.equal("Testlogo");
            expect(state.configJson.Portalconfig.portalTitle.toolTip).to.equal("TTT = Test-Tool-Tip");

            expect(state.configJson.Portalconfig.PortalTitle).to.be.undefined;
            expect(state.configJson.Portalconfig.PortalLogo).to.be.undefined;
            expect(state.configJson.Portalconfig.LogoLink).to.be.undefined;
            expect(state.configJson.Portalconfig.LogoToolTip).to.undefined;
        });
    });
});
