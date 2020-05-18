import Model from "@modules/tools/filter/model.js";
import {expect} from "chai";

describe("modules/tools/filter/model", function () {
    let model;

    before(function () {
        model = new Model();
    });

    describe("collectFilteredIds", function () {
        it("should return empty array for undefined input", function () {
            expect(model.collectFilteredIds(undefined))
                .to.be.an("array")
                .to.be.empty;
        });
    });

    describe("getQueryByTyp", function () {
        it("if \"GeoJSON\" should return valid model for geojson", function () {
            expect(model.getQueryByTyp("GeoJSON", null))
                .to.be.an("object");
        });

        it("if \"WFS\" should return valid model for geojson", function () {
            expect(model.getQueryByTyp("WFS", null))
                .to.be.an("object");
        });

        it("if \"GROUP\" should return valid object", function () {
            expect(model.getQueryByTyp("GROUP", null))
                .to.be.an("object");
        });

        it("if \"undefined\" should return null", function () {
            expect(model.getQueryByTyp(undefined, null))
                .to.be.null;
        });

        it("if \"null\" should return null", function () {
            expect(model.getQueryByTyp(null, null))
                .to.be.null;
        });

        it("if \"WMS\" as possible value should return null", function () {
            expect(model.getQueryByTyp("WMS", null))
                .to.be.null;
        });

        it("if \"Random String\" should return null", function () {
            expect(model.getQueryByTyp("-42-", null))
                .to.be.null;
        });
    });
});
