import {expect} from "chai";
import Model from "@modules/tools/filter/query/source/geojson.js";
import Util from "@testUtil";

describe("filter/query/source/geojson", function () {
    var model,
        utilModel,
        testFeatures;

    before(function () {
        model = new Model();
        utilModel = new Util();
        testFeatures = utilModel.createTestFeatures("resources/testFeatures.xml");
    });
    describe("createFeatureAttributesMap", function () {
        it("should return deep equal match with array if type is: \"Test\"", function () {
            expect(model.createFeatureAttributesMap(testFeatures, "Test")).to.deep.equal([
                {name: "kh_nummer", type: "Test"},
                {name: "name", type: "Test"},
                {name: "strasse", type: "Test"},
                {name: "ort", type: "Test"},
                {name: "homepage", type: "Test"},
                {name: "krankenhausverzeichnis", type: "Test"},
                {name: "anzahl_planbetten", type: "Test"},
                {name: "hinweiszeile", type: "Test"},
                {name: "anzahl_plaetze_teilstationaer", type: "Test"},
                {name: "teilnahme_notversorgung", type: "Test"},
                {name: "teilnahme_geburtsklinik", type: "Test"},
                {name: "geburtsklinik_differenziert", type: "Test"},
                {name: "stand", type: "Test"},
                {name: "geom", type: "Test"}
            ]);
        });

        it("should return deep equal match with array if type is: \"undefined\"", function () {
            expect(model.createFeatureAttributesMap(testFeatures, undefined)).to.deep.equal([
                {name: "kh_nummer", type: "string"},
                {name: "name", type: "string"},
                {name: "strasse", type: "string"},
                {name: "ort", type: "string"},
                {name: "homepage", type: "string"},
                {name: "krankenhausverzeichnis", type: "string"},
                {name: "anzahl_planbetten", type: "string"},
                {name: "hinweiszeile", type: "undefined"},
                {name: "anzahl_plaetze_teilstationaer", type: "string"},
                {name: "teilnahme_notversorgung", type: "string"},
                {name: "teilnahme_geburtsklinik", type: "string"},
                {name: "geburtsklinik_differenziert", type: "string"},
                {name: "stand", type: "string"},
                {name: "geom", type: "object"}
            ]);
        });

        it("should return empty array if there no features", function () {
            expect(model.createFeatureAttributesMap([], "Test")).to.be.an("array").that.is.empty;
        });

        it("should return deep equal match with array if type is integer: 123", function () {
            expect(model.createFeatureAttributesMap(testFeatures, 123)).to.deep.equal([
                {name: "kh_nummer", type: "123"},
                {name: "name", type: "123"},
                {name: "strasse", type: "123"},
                {name: "ort", type: "123"},
                {name: "homepage", type: "123"},
                {name: "krankenhausverzeichnis", type: "123"},
                {name: "anzahl_planbetten", type: "123"},
                {name: "hinweiszeile", type: "123"},
                {name: "anzahl_plaetze_teilstationaer", type: "123"},
                {name: "teilnahme_notversorgung", type: "123"},
                {name: "teilnahme_geburtsklinik", type: "123"},
                {name: "geburtsklinik_differenziert", type: "123"},
                {name: "stand", type: "123"},
                {name: "geom", type: "123"}
            ]);
        });

        it("should return deep equal match with array if type is: false", function () {
            expect(model.createFeatureAttributesMap(testFeatures, false)).to.deep.equal([
                {name: "kh_nummer", type: "false"},
                {name: "name", type: "false"},
                {name: "strasse", type: "false"},
                {name: "ort", type: "false"},
                {name: "homepage", type: "false"},
                {name: "krankenhausverzeichnis", type: "false"},
                {name: "anzahl_planbetten", type: "false"},
                {name: "hinweiszeile", type: "false"},
                {name: "anzahl_plaetze_teilstationaer", type: "false"},
                {name: "teilnahme_notversorgung", type: "false"},
                {name: "teilnahme_geburtsklinik", type: "false"},
                {name: "geburtsklinik_differenziert", type: "false"},
                {name: "stand", type: "false"},
                {name: "geom", type: "false"}
            ]);
        });

        it("should return empty array if there undefined features", function () {
            expect(model.createFeatureAttributesMap(undefined, "test")).to.be.an("array").that.is.empty;
        });
    });
});
