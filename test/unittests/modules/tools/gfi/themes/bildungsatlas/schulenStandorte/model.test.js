import Model from "@modules/tools/gfi/themes/bildungsatlas/schulenStandorte/model.js";
import {expect} from "chai";

let model, gfiContent, regex, gfiTheme, themeID;

before(function () {
    model = new Model();
    gfiContent = {
        "allProperties": {
            "C_S_Name": "Schule Rotenhäuser Damm",
            "C_S_Str": "Rotenhäuser Damm",
            "C_S_HNr": "45",
            "C_S_Ort": "Hamburg",
            "C_S_PLZ": "21107",
            "C_S_SI": "1",
            "SchPu_PrSt": "0",
            "C_S_SuS_ES": "41",
            "C_S_GTA": "GTS  mit Träger",
            "C_S_Zweig": "nein",
            "C_S_SuS": "276",
            "C_S_SuS_PS": "242",
            "C_S_SuS_S1": "0",
            "C_S_SuS_S2": "0",
            "Schule_SuS": "276",
            "Schule_PS": "242",
            "Schule_S1": "0",
            "Schule_S2": "0",
            "C_S_HomP": "http://www.schule-rhd45.hamburg.de",
            "extent": [565750.9170007939, 5929612.241942691, 565750.9170007939, 5929612.241942691]
        }
    };
    regex = /\B(?=(\d{3})+(?!\d))/g;
});

describe("tools/gfi/themes/bildungsatlas/schulenStandorte", function () {
    describe("parseGfiContent should parse testdata correctly", function () {
        it("should set all given values", function () {
            model.parseGfiContent(gfiContent);
            expect(model.get("schoolName")).to.equal(String(gfiContent.allProperties.C_S_Name));
            expect(model.get("streetNo")).to.equal(String(gfiContent.allProperties.C_S_Str + " " + gfiContent.allProperties.C_S_HNr));
            expect(model.get("postCity")).to.equal(String(gfiContent.allProperties.C_S_PLZ + " " + gfiContent.allProperties.C_S_Ort));
            expect(model.get("socialIndex")).to.equal(String(gfiContent.allProperties.C_S_SI === -1 ? "nicht vergeben" : gfiContent.allProperties.C_S_SI));
            expect(model.get("hooverSchool")).to.equal(String(gfiContent.allProperties.SchPu_PrSt === 0 ? "nein" : "ja"));
            expect(model.get("preSchool")).to.equal(String(gfiContent.allProperties.C_S_SuS_ES === 0 ? "nein" : "ja"));
            expect(model.get("allDaySchool")).to.equal(String(gfiContent.allProperties.C_S_GTA === 0 ? "nein" : "ja"));
            expect(model.get("schoolWithBranch")).to.equal(String(gfiContent.allProperties.C_S_Zweig));
            expect(model.get("countStudentsAll")).to.equal(String(gfiContent.allProperties.C_S_SuS).replace(regex, "."));
            expect(model.get("countStudents")).to.equal(String(gfiContent.allProperties.C_S_SuS - gfiContent.allProperties.C_S_SuS_ES).replace(regex, "."));
            expect(model.get("countStudentsPrimary")).to.equal(String(gfiContent.allProperties.C_S_SuS_PS).replace(regex, "."));
            expect(model.get("countStudentsSecondaryOne")).to.equal(String(gfiContent.allProperties.C_S_SuS_S1).replace(regex, "."));
            expect(model.get("countStudentsSecondaryTwo")).to.equal(String(gfiContent.allProperties.C_S_SuS_S2).replace(regex, "."));
            expect(model.get("countStudentsAllPlace")).to.equal(String(gfiContent.allProperties.Schule_SuS).replace(regex, "."));
            expect(model.get("countStudentsPrimaryAllPlace")).to.equal(String(gfiContent.allProperties.Schule_PS).replace(regex, "."));
            expect(model.get("countStudentsSecondaryOneAllPlace")).to.equal(String(gfiContent.allProperties.Schule_S1).replace(regex, "."));
            expect(model.get("countStudentsSecondaryTwoAllPlace")).to.equal(String(gfiContent.allProperties.Schule_S2).replace(regex, "."));
            expect(model.get("schoolUrl")).to.equal(String(gfiContent.allProperties.C_S_HomP));
        });
    });
});
