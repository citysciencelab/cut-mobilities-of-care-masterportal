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
            testFeatures = utilModel.createTestFeatures();
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
                testFeature = utilModel.createTestFeatures()[0];
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
        describe("getRemainingAttributeValues", function () {
            var testFeatures = [],
                featureAttributesMap = [],
                featureAttributesMap2 = [];

            before(function () {
                featureAttributesMap.push({name: "teilnahme_notversorgung", type: "boolean"});
                featureAttributesMap2.push({name: "strasse", type: "string"});

                testFeatures.push(utilModel.createTestFeatures()[1]);
                testFeatures.push(utilModel.createTestFeatures()[2]);

            });
            it("should return all available Values for Boolean Attributes in AttributesMap fo given Features", function () {
                expect(model.getRemainingAttributeValues(featureAttributesMap, testFeatures)[0].values)
                    .to.be.an("array")
                    .to.have.deep.members(["false", "true"]);
            });

            it("should return all available Values for the String Attributes in AttributesMap fo given Features", function () {
                expect(model.getRemainingAttributeValues(featureAttributesMap2, testFeatures)[0].values)
                    .to.be.an("array")
                    .to.have.deep.members(["Kayhuder Straße 65", "Süntelstraße 11a"]);
            });
        });
        describe("collectSelectableOptions", function () {
            var testFeatures = [],
                featureAttributesMap = [],
                selectedAttributes = [];

            before(function () {
                selectedAttributes.push({attrName: "teilnahme_notversorgung", type: "boolean", values: ["true"]});
                featureAttributesMap.push({name: "strasse", type: "string", values: ["Kayhuder Straße 65", "Süntelstraße 11a"]});
                featureAttributesMap.push({name: "name", type: "string", values: ["Heinrich Sengelmann Krankenhaus", "Albertinen-Krankenhaus"]});
                featureAttributesMap.push({name: "teilnahme_notversorgung", type: "boolean", values: ["false", "true"]});
                testFeatures.push(utilModel.createTestFeatures()[1]);
                testFeatures.push(utilModel.createTestFeatures()[2]);
            });
            it("should return all selectable Values for the String Attributes in AttributesMap for given Features", function () {
                expect(model.collectSelectableOptions(testFeatures, selectedAttributes, featureAttributesMap))
                    .to.be.an("array")
                    .to.deep.include({name: "strasse", values: ["Süntelstraße 11a"]})
                    .to.deep.include({name: "name", values: ["Albertinen-Krankenhaus"]})
                    .to.deep.include({name: "teilnahme_notversorgung", values: ["false", "true"]});
            });
            it("should return all values from featureAttributesMap if selectedAttributes is empty", function () {
                expect(model.collectSelectableOptions(testFeatures, [], featureAttributesMap))
                    .to.be.an("array")
                    .to.deep.include(_.omit(featureAttributesMap[0], "type"))
                    .to.deep.include(_.omit(featureAttributesMap[1], "type"))
                    .to.deep.include(_.omit(featureAttributesMap[2], "type"));
            });

        });
        describe("isIntegerInRange", function () {
            it("should match if feature value is within a range", function () {
                var attribute = {attrName: "anzahl_planbetten", values: ["120", "300"]};

                expect(model.isIntegerInRange(testFeatures[0], attribute)).to.be.true;
            });
            it("should not match if feature value is not within a range", function () {
                var attribute = {attrName: "anzahl_planbetten", values: ["120", "200"]};

                expect(model.isIntegerInRange(testFeatures[0], attribute)).to.be.false;
            });
            it("should not match if attribute values is empty", function () {
                var attribute = {attrName: "anzahl_planbetten", values: []};

                expect(model.isIntegerInRange(testFeatures[0], attribute)).to.be.false;
            });
        });
    });
});
