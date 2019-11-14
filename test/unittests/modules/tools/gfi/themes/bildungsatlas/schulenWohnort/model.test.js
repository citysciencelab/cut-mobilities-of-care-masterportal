import Model from "@modules/tools/gfi/themes/bildungsatlas/schulenWohnort/model.js";
import {expect} from "chai";

let model, gfiContent, layerSchoolLevel, accountStudents, accountStudentSecondary, level;

before(function () {
    model = new Model();
    gfiContent = {
        "allProperties": {
            "StatGeb_Nr": 103004,
            "ST_Name": "Neuenfelde",
            "C12_SuS": 19,
            "C32_SuS": 23
        }
    };
    layerSchoolLevel = "secondary";
    accountStudents = 19;
    accountStudentSecondary = 23;
    level = {"primary": "Primarstufe", "secondary": "Sekundarstufe I"};
});

describe("tools/gfi/themes/bildungsatlas/schulenwohnort", function () {
    describe("onIsVisibleEvent should set internal variable", function () {
        it("should set isCreated to false", function () {
            model.onIsVisibleEvent(false);
            expect(model.get("isCreated")).to.be.false;
        });
        it("should set isCreated to true", function () {
            model.onIsVisibleEvent(true);
            expect(model.get("isCreated")).to.be.true;
        });
    });

    describe("onGFIIsVisibleEvent should set isCreated false", function () {
        it("should set isCreated to false", function () {
            model.onGFIIsVisibleEvent(false);
            expect(model.get("isCreated")).to.be.false;
        });
    });

    describe("getHomeAddressLayer", function () {
        it("should return false", function () {
            expect(model.getHomeAddressLayer()).to.be.false;
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
        it("should return certain value", function () {
            expect(model.getStatisticAreasConfig()).to.be.false;
        });
    });

    describe("parseGfiContent should parse testdata correctly", function () {
        it("should set all given values", function () {
            model.parseGfiContent(gfiContent);
            expect(model.get("accountStudents")).to.equal(Math.round(gfiContent.allProperties.C12_SuS).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
            expect(model.get("urbanArea")).to.equal("Statistisches Gebiet: " + gfiContent.allProperties.StatGeb_Nr + "<br>(" + gfiContent.allProperties.ST_Name + ")");
            expect(model.get("urbanAreaNr")).to.equal(gfiContent.allProperties.StatGeb_Nr);
        });
    });

    describe("updateTemplateValue should parse testdata correctly", function () {
        it("should set all given values", function () {
            model.updateTemplateValue(accountStudents, level, layerSchoolLevel, accountStudentSecondary);
            expect(model.get("accountStudents")).to.equal(Math.round(accountStudentSecondary).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
            expect(model.get("schoolLevel")).to.equal(layerSchoolLevel);
            expect(model.get("level")).to.equal(level);
        });
    });
});
