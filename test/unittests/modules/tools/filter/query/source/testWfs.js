define(function(require) {
    var expect = require("chai").expect,
        Util = require("util"),
        Model = require("../../../../../../../modules/tools/filter/query/source/wfs.js");

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
            it("should match when feature matches at least one attribute value", function () {
                var attribute = {attrName: "teilnahme_geburtsklinik", values: ["Nein"]};

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
            var testFeatures = [],
                featureAttributesMap = [],
                selectedAttributes = [];

            before(function () {
                selectedAttributes.push({attrName: "teilnahme_notversorgung", type: "boolean", values: ["true"]});
                featureAttributesMap.push({name: "strasse", displayName: undefined, type: "string", values: []});
                featureAttributesMap.push({name: "name", displayName: undefined, type: "string", values: []});
                featureAttributesMap.push({name: "teilnahme_notversorgung", displayName: undefined, type: "boolean", values: []});
                testFeatures.push(utilModel.createTestFeatures("resources/testFeatures.xml")[1]);
                testFeatures.push(utilModel.createTestFeatures("resources/testFeatures.xml")[2]);
            });
            it("should return all selectable Values for the String Attributes in AttributesMap for given Features", function () {
                expect(model.collectSelectableOptions(testFeatures, selectedAttributes, featureAttributesMap)[0])
                    .to.deep.equal({name: "strasse", displayName: undefined, type: "string", values: ["Süntelstraße 11a"]});
            });
            it("should return all values for all Attributes defined in featureAttributesMap if selectedAttributes is empty", function () {
                expect(model.collectSelectableOptions(testFeatures, [], featureAttributesMap)[0])
                    .to.deep.equal({name: "strasse", displayName: undefined, type: "string", values: ["Kayhuder Straße 65", "Süntelstraße 11a"]});
                expect(model.collectSelectableOptions(testFeatures, [], featureAttributesMap)[1])
                    .to.deep.equal({name: "name", displayName: undefined, type: "string", values: ["Heinrich Sengelmann Krankenhaus", "Albertinen-Krankenhaus"]});
                expect(model.collectSelectableOptions(testFeatures, [], featureAttributesMap)[2])
                    .to.deep.equal({name: "teilnahme_notversorgung", displayName: undefined, type: "boolean", values: ["false", "true"]});
            });
        });
    });
});
