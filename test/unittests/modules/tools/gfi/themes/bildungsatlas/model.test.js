import Model from "@modules/tools/gfi/themes/bildungsatlas/schulenEinzugsgebiete/model.js";
import {expect} from "chai";

let model, gfiContent;

before(function () {
    model = new Model();
    gfiContent = {
        "allProperties": {
            "C_S_HNr": "18",
            "C_S_Name": "Katharinenschule in der Hafencity",
            "C_S_Nr": 5101,
            "C_S_Ort": "Hamburg",
            "C_S_PLZ": "20457",
            "C_S_SI": "4",
            "C_S_Str": "Am Dalmannkai",
            "C_S_SuS_ES": "41",
            "C_S_SuS_PS": "256",
            "C_S_SuS_S1": "0",
            "C_S_SuS_S2": "0",
            "extent": [565905.6000007964, 5933033.59994271, 565905.6000007964, 5933033.59994271],
            "schoolKey": "primarySchoolsInArea",
            "styling": "grundschule"
        }
    };
});

describe("tools/gfi/themes/bildungsatlas/schulenEinzugsgebiete", function () {
    describe("onIsVisibleEvent should set internal variable", function () {
        it("should set isCreated to false", function () {
            model.onIsVisibleEvent(null, false);
            expect(model.get("isCreated")).to.be.false;
        });
        it("should set isCreated to true", function () {
            model.onIsVisibleEvent(null, true);
            expect(model.get("isCreated")).to.be.true;
        });
    });

    describe("parseGfiContent should parse testdata correctly", function () {
        it("should ignore missing values using defaults", function () {
            model.parseGfiContent({"allProperties": {}});
            expect(model.get("id")).to.have.string("");
            expect(model.get("name")).to.have.string("");
            expect(model.get("address")).to.have.string("");
            expect(model.get("countStudents")).to.have.string("");
            expect(model.get("countStudentsPrimary")).to.have.string("");
            expect(model.get("countStudentsSecondary")).to.have.string("");
            expect(model.get("socialIndex")).to.have.string("");
            expect(model.get("schoolKey")).to.have.string("");
        });
        it("should set all given values", function () {
            model.parseGfiContent(gfiContent);
            expect(model.get("id")).to.equal(String(gfiContent.allProperties.C_S_Nr));
            expect(model.get("name")).to.equal(gfiContent.allProperties.C_S_Name);
            expect(model.get("address")).to.equal(gfiContent.allProperties.C_S_Str + " " + gfiContent.allProperties.C_S_HNr + ", " + gfiContent.allProperties.C_S_PLZ + " " + gfiContent.allProperties.C_S_Ort);
            expect(model.get("countStudents")).to.equal(String(parseInt(gfiContent.allProperties.C_S_SuS_PS, 10) + parseInt(gfiContent.allProperties.C_S_SuS_S1, 10)));
            expect(model.get("countStudentsPrimary")).to.equal(gfiContent.allProperties.C_S_SuS_PS);
            expect(model.get("countStudentsSecondary")).to.equal(gfiContent.allProperties.C_S_SuS_S1);
            expect(model.get("socialIndex")).to.equal(gfiContent.allProperties.C_S_SI);
            expect(model.get("schoolKey")).to.equal(gfiContent.allProperties.schoolKey);
        });
    });

    describe("getText", function () {
        it("should calculate correct proportion and return text", function () {
            expect(model.getText(5, 100)).to.have.string("Anteil 5% (Anzahl: 5)");
        });
        it("should calculate correct proportion and return text", function () {
            expect(model.getText(1, 489)).to.have.string("Anteil 1% (Anzahl: 5)");
        });
    });

    describe("getCategory", function () {
        it("should return correct categories", function () {
            expect(model.getCategory(-2)).to.have.string("<5");
            expect(model.getCategory(8)).to.have.string("<10");
            expect(model.getCategory(14)).to.have.string("<15");
            expect(model.getCategory(30)).to.have.string(">=30");
            expect(model.getCategory(31)).to.have.string(">=30");
        });
    });

    describe("getEinzugsgebieteLayer", function () {
        it("should return false", function () {
            expect(model.getEinzugsgebieteLayer()).to.be.false;
        });
    });

    describe("getStatisticAreasLayer", function () {
        it("should return false", function () {
            expect(model.getStatisticAreasLayer()).to.be.false;
        });
    });

    describe("getStatisticAreasConfig", function () {
        it("should return false", function () {
            expect(model.getStatisticAreasConfig()).to.be.false;
        });
    });
});
