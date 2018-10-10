import {expect} from "chai";
import Model from "@modules/tools/filter/query/source/wfs.js";
import Util from "@testUtil";

describe("filter/query/source/wfs", function () {
    var model,
        utilModel,
        testFeatures;

    before(function () {
        model = new Model();
        utilModel = new Util();
        testFeatures = utilModel.createTestFeatures("resources/testFeatures.xml");
    });
    describe("isValueMatch", function () {
        var featureAttributesMap = [{name: "teilnahme_geburtsklinik", matchingMode: "OR"}];

        before(function () {
            model.setFeatureAttributesMap(featureAttributesMap);
        });
        it("should match when feature matches at least one attribute value", function () {
            var attribute = {attrName: "teilnahme_geburtsklinik", values: ["Nein"], matchingMode: "OR"};

            expect(model.isValueMatch(testFeatures[0], attribute)).to.be.true;
        });
        it("should not match when feature matches none of the attribute values", function () {
            var attribute = {attrName: "teilnahme_geburtsklinik", values: ["haha"]};

            expect(model.isValueMatch(testFeatures[1], attribute)).to.be.false;
        });
        it("should not match when attribute values is empty", function () {
            var attribute = {attrName: "teilnahme_geburtsklinik", values: []};

            expect(model.isValueMatch(testFeatures[1], attribute)).to.be.false;
        });
    });
    describe("getValuesFromFeature", function () {
        var testFeature = {};

        before(function () {
            testFeature = utilModel.createTestFeatures("resources/testFeatures.xml")[0];
        });
        it("should return '[Bodelschwinghstraße 24]' for a Attribute 'strasse'", function () {
            expect(model.getValuesFromFeature(testFeature, "strasse", "string"))
                .to.be.an("array")
                .that.includes("Bodelschwinghstraße 24");
        });
        it("should return \"['www.krankenhausverzeichnis.de','www.google.com','www.hamburg.de']\" for a Attribute 'krankenhausverzeichnis'", function () {
            expect(model.getValuesFromFeature(testFeature, "krankenhausverzeichnis", "string"))
                .to.be.an("array")
                .that.includes("www.krankenhausverzeichnis.de")
                .that.includes("www.google.com")
                .that.includes("www.hamburg.de");
        });
        it("should return 'false' for a Attribute 'teilnahme_notversorgung'", function () {
            expect(model.getValuesFromFeature(testFeature, "teilnahme_notversorgung", "boolean"))
                .to.be.an("array")
                .that.includes("false");
        });
    });
    describe("collectSelectableOptions", function () {
        var featureAttributesMap = [],
            selectedAttributes = [];

        before(function () {
            selectedAttributes.push({attrName: "teilnahme_notversorgung", type: "boolean", values: ["true"], matchingMode: "OR"});
            featureAttributesMap.push({name: "strasse", displayName: undefined, type: "string", values: [], matchingMode: "OR"});
            featureAttributesMap.push({name: "name", displayName: undefined, type: "string", values: [], matchingMode: "OR"});
            featureAttributesMap.push({name: "teilnahme_notversorgung", displayName: undefined, type: "boolean", values: [], matchingMode: "OR"});

            model.setFeatureAttributesMap(featureAttributesMap);

            testFeatures.push(utilModel.createTestFeatures("resources/testFeatures.xml")[1]);
            testFeatures.push(utilModel.createTestFeatures("resources/testFeatures.xml")[2]);
        });
        it("should return all selectable Values for the String Attributes in AttributesMap for given Features", function () {
            expect(model.collectSelectableOptions(testFeatures, selectedAttributes, featureAttributesMap)[0])
                .to.deep.equal({name: "strasse", displayName: undefined, type: "string", values: ["Süntelstraße 11a"], matchingMode: "OR"});
        });
        it("should return all values for all Attributes defined in featureAttributesMap if selectedAttributes is empty", function () {
            expect(model.collectSelectableOptions(testFeatures, [], featureAttributesMap)[0])
                .to.deep.equal({name: "strasse", displayName: undefined, type: "string", values: [
                    "Bodelschwinghstraße 24", "Kayhuder Straße 65", "Süntelstraße 11a", "Hohe Weide 17", "Martinistraße 52", "Martinistraße 78", "Oskar-Schlemmer-Straße 9-17", "Suurheid 20", "Bleickenallee 38", "Liliencronstraße 130", "Jüthornstraße 71", "Dehnhaide 120", "Hanredder 32", "Wöhrendamm 80", "Daldorfer Straße 2", "Haselkamp 33", "Lohmühlenstraße 5", "Langenhorner Chaussee 560", "Lesserstraße 180", "Groß-Sand  3", "Jürgensallee 46-48", "Admiralitätsstraße 4", "Alte Holstenstraße 2 - 16", "Jarrestraße 6", "Tangstedter Landstraße 400", "Alphonsstraße 14", "Rübenkamp 220", "Alfredstraße 9", "Stader Straße 203c", "Eißendorfer Pferdeweg 52", "Paul-Ehrlich-Straße 1", "Glindersweg 80", "Kösterbergstraße 32", "Sellhopsweg 18-20", "Orchideenstieg 14", "Moorkamp 2-6", "Bergedorfer Straße 10", "Holstenstraße 2", "Budapester Straße 38"
                ], matchingMode: "OR"});
            expect(model.collectSelectableOptions(testFeatures, [], featureAttributesMap)[1])
                .to.deep.equal({name: "name", displayName: undefined, type: "string", values: [
                    "Evangelisches Krankenhaus Alsterdorf", "Heinrich Sengelmann Krankenhaus", "Albertinen-Krankenhaus", "Agaplesion Diakonieklinikum Hamburg", "Universitäres Herzzentrum Hamburg GmbH", "Facharztklinik Hamburg", "Psychiatrische Tagesklinik der Praxisklinik Mümmelmannsberg", "Asklepios Westklinikum Hamburg", "Altonaer Kinderkrankenhaus", "Katholisches Kinderkrankenhaus Wilhelmstift", "Asklepios Klinik Nord - Wandsbek (Psychiatrie)", "Schön Klinik Hamburg Eilbek", "Fachklinik Bokholt", "LungenClinic Großhansdorf", "Psychiatrisches Zentrum Rickling", "Ev. Amalie-Sieveking-Krankenhaus", "Asklepios Klinik St. Georg", "Asklepios Klinik Nord - Ochsenzoll (Psychiatrie)", "Bundeswehrkrankenhaus Hamburg", "Wilhelmsburger Krankenhaus Groß-Sand", "Klinik Dr. Guth", "Klinik Fleetinsel Hamburg", "Praxisklinik Bergedorf", "Verhaltenstherapie Falkenried", "Stadtteilklinik Hamburg", "Asklepios Klinik Nord - Heidberg (Somatik)", "Asklepios Klinik Wandsbek", "Asklepios Klinik Barmbek", "Katholisches Marienkrankenhaus", "HELIOS Mariahilf Klinik Hamburg", "Asklepios Klinikum Harburg", "Asklepios Klinik Altona", "Bethesda Krankenhaus Bergedorf", "Krankenhaus Tabea", "Albertinen-Haus - Medizinisch-Geriatrische Klinik", "Israelitisches Krankenhaus", "Krankenhaus Jerusalem", "BG Klinikum Hamburg gGmbH", "Helios Endo-Klinik Hamburg", "Psychiatrische Tagesklinik Hamburg-Mitte", "Universitätsklinikum Hamburg-Eppendorf"
                ], matchingMode: "OR"});
            expect(model.collectSelectableOptions(testFeatures, [], featureAttributesMap)[2])
                .to.deep.equal({name: "teilnahme_notversorgung", displayName: undefined, type: "boolean", values: [
                    "false", "true", "Ja", "Eingeschränkt", "Nein"
                ], matchingMode: "OR"});
        });
    });
});
