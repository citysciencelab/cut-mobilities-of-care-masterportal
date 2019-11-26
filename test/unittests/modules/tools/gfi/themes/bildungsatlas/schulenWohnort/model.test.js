import Model from "@modules/tools/gfi/themes/bildungsatlas/schulenWohnort/model.js";
import {expect} from "chai";

let model; // , gfiContent, layerSchoolLevel, accountStudents, accountStudentSecondary, level;

before(function () {
    model = new Model();
    /*
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
    */
});

describe("tools/gfi/themes/bildungsatlas/schulenwohnort", function () {
    describe("onIsVisibleEvent should set internal variable", function () {
        it("should let isCreated as it is if not visible", function () {
            model.set("isCreated", "foo");
            model.onIsVisibleEvent(false);
            expect(model.get("isCreated")).to.equal("foo");
        });
        it("should let isCreated as it is if visible but created already", function () {
            model.set("isCreated", "foo");
            model.onIsVisibleEvent(true);
            expect(model.get("isCreated")).to.equal("foo");
        });

        /*
        it("should set isCreated to true if visible and not yet created", function () {
            model.set("gfiContent", gfiContent);
            model.set("isCreated", false);
            model.onIsVisibleEvent(true);
            expect(model.get("isCreated")).to.be.true;
        });
        */
    });

    /*
    describe("onGFIIsVisibleEvent should set isCreated false", function () {
        it("should set isCreated to false", function () {
            model.onGFIIsVisibleEvent(false);
            expect(model.get("isCreated")).to.be.false;
        });
    });

    describe("getLayerStatisticAreas", function () {
        it("should return false", function () {
            expect(model.getLayerStatisticAreas()).to.be.false;
        });
    });

    describe("getLayerSchools", function () {
        it("should return false", function () {
            expect(model.getLayerSchools()).to.be.false;
        });
    });

    describe("parseGfiContent should parse testdata correctly", function () {
        it("should set all given values", function () {
            model.set("gfiContent", gfiContent);
            model.setGFIProperties();
            expect(model.get("accountStudents")).to.equal(Math.round(gfiContent.allProperties.C12_SuS).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
            expect(model.get("urbanArea")).to.equal(gfiContent.allProperties.ST_Name);
            expect(model.get("urbanAreaNr")).to.equal(gfiContent.allProperties.StatGeb_Nr);
        });
    });
    */
});
