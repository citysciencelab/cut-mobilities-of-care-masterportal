import {expect} from "chai";
import Util from "@testUtil";
import Model from "@modules/cswParser/model.js";

describe("modules/cswParser", function () {
    var model,
        utilModel,
        xmlDoc,
        citation,
        dates;

    before(function () {
        model = new Model();
        utilModel = new Util();
        xmlDoc = utilModel.getCswResponse();
        citation = $("gmd\\:citation,citation", xmlDoc);
        dates = $("gmd\\:CI_Date,CI_Date", citation);
    });

    describe("parseDate", function () {
        it("should return null if xmlDoc is undefined", function () {
            expect(model.parseDate()).to.be.null;
        });
        it("should return latest date for given xmlDoc", function () {
            expect(model.parseDate(xmlDoc)).to.be.a("string").to.equal("31.12.2013");
        });
        it("should return null because no revision date is found", function () {
            expect(model.parseDate(xmlDoc, "revision")).to.be.null;
        });
        it("should return latest date for given xmlDoc", function () {
            expect(model.parseDate(xmlDoc, "publication")).to.be.a("string").to.equal("31.12.2013");
        });
        it("should return null because no revision date is found", function () {
            expect(model.parseDate(xmlDoc, "creation")).to.be.null;
        });
        it("should return publication date as fallback to creation date", function () {
            expect(model.parseDate(xmlDoc, "creation", "publication")).to.be.a("string").to.equal("31.12.2013");
        });
        it("should return null because neither revision date nor creation create are found", function () {
            expect(model.parseDate(xmlDoc, "revision", "creation")).to.be.null;
        });
    });
    describe("getNormalDateTimeString", function () {
        it("should return undefined if dates is undefined", function () {
            expect(model.getNormalDateTimeString()).to.be.undefined;
        });
        it("should return undefined if dates is undefined", function () {
            expect(model.getNormalDateTimeString(dates)).to.be.a("string").to.equal("2013-12-31T00:00:00.000+01:00");
        });
    });
    describe("getDateTimeStringByStatus", function () {
        it("should return undefined if dates and status and fallbackStatus is undefined", function () {
            expect(model.getDateTimeStringByStatus()).to.be.undefined;
        });
        it("should return publication date", function () {
            expect(model.getDateTimeStringByStatus(dates, "publication")).to.be.a("string").to.equal("2013-12-31T00:00:00.000+01:00");
        });
        it("should return undefined because no revision date is found", function () {
            expect(model.getDateTimeStringByStatus(dates, "revision")).to.be.undefined;
        });
        it("should return undefined as revision date and fallback creation date are undefined", function () {
            expect(model.getDateTimeStringByStatus(dates, "revision", "creation")).to.be.undefined;
        });
        it("should return fallback publication date as revision date is undefined", function () {
            expect(model.getDateTimeStringByStatus(dates, "revision", "publication")).to.be.a("string").to.equal("2013-12-31T00:00:00.000+01:00");
        });
    });
});
