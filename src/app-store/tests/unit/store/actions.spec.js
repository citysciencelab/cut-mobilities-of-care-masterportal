import {expect} from "chai";
import actions from "../../../actions";

const deprecatedParamsConfigJson = {
        "Portalconfig.portalTitle.title": ["Portalconfig.PortalTitle"],
        "Portalconfig.portalTitle.logo": ["Portalconfig.PortalLogo"],
        "Portalconfig.portalTitle.link": ["Portalconfig.LogoLink"],
        "Portalconfig.portalTitle.toolTip": ["Portalconfig.portalTitle.tooltip", "Portalconfig.LogoToolTip"],
        "Portalconfig.searchBar.bkg.zoomToResultOnHover": ["Portalconfig.searchBar.bkg.zoomToResult"],
        "Portalconfig.treeType": ["Portalconfig.Baumtyp"],
        "Portalconfig.controls.overviewMap.layerId": ["Portalconfig.controls.overviewMap.baselayer"],
        "Portalconfig.mapView.startResolution": ["Portalconfig.mapView.resolution"],
        "Portalconfig.searchBar.startZoomLevel": ["Portalconfig.searchBar.zoomLevel"]
    },
    singleDeprecatedEntryCase1 = ["Portalconfig.portalTitle.title", ["Portalconfig.PortalTitle"]],
    singleDeprecatedEntryCase2 = ["Portalconfig.treeType", ["Portalconfig.Baumtyp"]],
    singleDeprecatedEntryCase3 = ["Portalconfig.portalTitle.toolTip", ["Portalconfig.LogoToolTip", "Portalconfig.portalTitle.tooltip"]],

    configCase1 = {
        Portalconfig: {
            PortalTitle: "Testname",
            PortalLogo: "Testlink.de",
            LogoLink: "Testlogo",
            LogoToolTip: "Testtooltip"
        }
    },
    configCase2 = {
        Portalconfig: {
            portalTitle: {
                title: "Testname",
                logo: "Testlink.de",
                link: "Testlogo",
                tooltip: "Testtooltip"
            }
        }
    },
    configCase3 = {
        Portalconfig: {
            PortalTitle: "Testname",
            PortalLogo: "Testlink.de",
            LogoLink: "Testlogo",
            LogoToolTip: "Testtooltip"
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
    },
    parametersCase3 = {
        "newSplittedPath": ["Portalconfig", "portalTitle", "toolTip"],
        "oldSplittedPath": ["Portalconfig", "portalTitle", "tooltip"],
        "output": "Testtooltip",
        "deprecatedKey": "tooltip"
    };

describe("src/app/store/actions.js", () => {
    describe("getDeprecatedParameters", () => {
        it("should return an object with the correct defined parameters: newSplittedPath, oldSplittedPath, output, deprecatedKey.", () => {
            const configCopy = {...configCase1},
                testReturn = actions.getDeprecatedParameters(singleDeprecatedEntryCase1, configCopy);

            expect(testReturn).to.be.an("Object");
            expect(testReturn.newSplittedPath).to.deep.equal(["Portalconfig", "portalTitle", "title"]);
            expect(testReturn.oldSplittedPath).to.deep.equal(["Portalconfig", "PortalTitle"]);
            expect(testReturn.output).to.equal("Testname");
            expect(testReturn.deprecatedKey).to.equal("PortalTitle");
        });

        it("should return undefined.", () => {
            const configCopy = {...configCase1},
                testReturn = actions.getDeprecatedParameters(singleDeprecatedEntryCase2, configCopy);

            expect(testReturn).to.be.undefined;
        });
        it("should return an object with defined parameters", () => {
            const configCopy = {...configCase2},
                testReturn = actions.getDeprecatedParameters(singleDeprecatedEntryCase3, configCopy);

            expect(testReturn).to.be.an("Object");
            expect(testReturn.newSplittedPath).to.deep.equal(["Portalconfig", "portalTitle", "toolTip"]);
            expect(testReturn.oldSplittedPath).to.deep.equal(["Portalconfig", "portalTitle", "tooltip"]);
            expect(testReturn.output).to.equal("Testtooltip");
            expect(testReturn.deprecatedKey).to.equal("tooltip");
        });
        it("should return an object with defined parameters", () => {
            const configCopy = {...configCase1},
                testReturn = actions.getDeprecatedParameters(singleDeprecatedEntryCase3, configCopy);

            expect(testReturn).to.be.an("Object");
            expect(testReturn.newSplittedPath).to.deep.equal(["Portalconfig", "portalTitle", "toolTip"]);
            expect(testReturn.oldSplittedPath).to.deep.equal(["Portalconfig", "LogoToolTip"]);
            expect(testReturn.output).to.equal("Testtooltip");
            expect(testReturn.deprecatedKey).to.equal("LogoToolTip");
        });
    });

    describe("replaceDeprecatedCode", () => {
        it("should return an updated config with replaced deprecated parameters", () => {
            const configCopy = {...configCase1},
                testReturn = actions.replaceDeprecatedCode(parametersCase1, configCopy);

            expect(testReturn).to.be.an("Object");
            expect(testReturn.Portalconfig.portalTitle.title).to.equal("Testname");
            expect(testReturn.Portalconfig.PortalTitle).to.be.undefined;
        });
        it("should return an updated config with replaced deprecated parameters", () => {
            const configCopy = {...configCase2},
                testReturn = actions.replaceDeprecatedCode(parametersCase3, configCopy);

            expect(testReturn).to.be.an("Object");
            expect(testReturn.Portalconfig.portalTitle.toolTip).to.equal("Testtooltip");
            expect(testReturn.Portalconfig.tooltip).to.be.undefined;
        });
        it("should return an unchanged object compared to the transferred config", () => {
            const configCopy = {...configCase3},
                testReturn = actions.replaceDeprecatedCode(parametersCase2, configCopy);

            expect(testReturn).to.deep.equal(configCopy);
        });
    });

    describe("checkWhereDeprecated", () => {
        it("it should return an object with the correct keys and values", () => {
            const config = {
                    Portalconfig: {
                        PortalTitle: "Testname",
                        PortalLogo: "Testlogo",
                        LogoLink: "Testlink",
                        LogoToolTip: "Testtooltip",
                        Baumtyp: true,
                        searchBar: {
                            bkg: {
                                zoomToResult: true
                            },
                            zoomLevel: 9
                        },
                        controls: {
                            overviewMap: {
                                baselayer: false
                            }
                        },
                        mapView: {
                            resolution: 40
                        }
                    }
                },

                testReturn = actions.checkWhereDeprecated(deprecatedParamsConfigJson, config);

            expect(testReturn.Portalconfig).to.be.an("Object");
            expect(testReturn.Portalconfig.portalTitle.title).to.equal("Testname");
            expect(testReturn.Portalconfig.portalTitle.logo).to.equal("Testlogo");
            expect(testReturn.Portalconfig.portalTitle.link).to.equal("Testlink");
            expect(testReturn.Portalconfig.portalTitle.toolTip).to.equal("Testtooltip");
            expect(testReturn.Portalconfig.treeType).to.be.true;
            expect(testReturn.Portalconfig.searchBar.bkg.zoomToResultOnHover).to.be.true;
            expect(testReturn.Portalconfig.searchBar.startZoomLevel).to.equal(9);
            expect(testReturn.Portalconfig.controls.overviewMap.layerId).to.be.false;
            expect(testReturn.Portalconfig.mapView.startResolution).to.equal(40);

            expect(testReturn.Portalconfig.PortalTitle).to.be.undefined;
            expect(testReturn.Portalconfig.PortalLogo).to.be.undefined;
            expect(testReturn.Portalconfig.LogoLink).to.be.undefined;
            expect(testReturn.Portalconfig.LogoToolTip).to.undefined;
            expect(testReturn.Portalconfig.searchBar.bkg.zoomToResult).to.be.undefined;
            expect(testReturn.Portalconfig.Baumtyp).to.be.undefined;
            expect(testReturn.Portalconfig.controls.overviewMap.baselayer).to.be.undefined;
            expect(testReturn.Portalconfig.mapView.resolution).to.be.undefined;
            expect(testReturn.Portalconfig.searchBar.zoomLevel).to.be.undefined;
        });

        it("it should return an object with the correct keys and values", () => {
            const config = {
                    Portalconfig: {
                        portalTitle: {
                            title: "Testname",
                            logo: "Testlogo",
                            link: "Testlink",
                            tooltip: "tooltip mit kleinem t"
                        }
                    }
                },

                testReturn = actions.checkWhereDeprecated(deprecatedParamsConfigJson, config);

            expect(testReturn.Portalconfig).to.be.an("Object");
            expect(testReturn.Portalconfig.portalTitle.title).to.equal("Testname");
            expect(testReturn.Portalconfig.portalTitle.logo).to.equal("Testlogo");
            expect(testReturn.Portalconfig.portalTitle.link).to.equal("Testlink");
            expect(testReturn.Portalconfig.portalTitle.toolTip).to.equal("tooltip mit kleinem t");

            expect(testReturn.Portalconfig.portalTitle.tooltip).to.undefined;
        });

        it("it should return an object with input values", () => {
            const config = {
                    Portalconfig: {
                        "portalTitle": {
                            "title": "Testname",
                            "logo": "Testlogo",
                            "link": "Testlink",
                            "toolTip": "Testtooltip"
                        }
                    }
                },
                testReturn = actions.checkWhereDeprecated(deprecatedParamsConfigJson, config);

            expect(testReturn.Portalconfig).to.be.an("Object");
            expect(testReturn.Portalconfig).to.equal(config.Portalconfig);
        });
    });
});
