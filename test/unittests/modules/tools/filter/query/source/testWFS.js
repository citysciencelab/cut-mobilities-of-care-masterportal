import {expect} from "chai";
import Model from "@modules/tools/filter/query/source/wfs.js";

describe("filter/query/source/wfs", function () {
    var model;

    beforeEach(function () {
        model = new Model();
    });

    describe("Extract snippet types from wfs describefeatureType-response", function () {

        it("should parse a XML-string without namespace", function () {

            var xmlString = `
                <?xml version='1.0' encoding='UTF-8'?>
                <schema xmlns="http://www.w3.org/2001/XMLSchema" xmlns:gml="http://www.opengis.net/gml">
                    <element name="krankenhaeuser_hh" substitutionGroup="gml:_Feature">
                        <complexType>
                            <complexContent>
                                <extension base="gml:AbstractFeatureType">
                                    <sequence>
                                        <element name="kh_nummer" minOccurs="0" type="string"/>
                                        <element name="anzahl_plaetze_teilstationaer" minOccurs="0" type="integer"/>
                                    </sequence>
                                </extension>
                            </complexContent>
                        </complexType>
                    </element>
                </schema>`;

            model.createSnippets = function (featureAttributesMap) {

                expect(featureAttributesMap).to.be.deep.equal([
                    {
                        name: "kh_nummer",
                        type: "string"
                    },
                    {
                        name: "anzahl_plaetze_teilstationaer",
                        type: "integer"
                    }
                ]);
            };

            model.parseResponse(xmlString);

        });

        it("should parse a XML with namespace (formated)", function () {

            var parser = new DOMParser(),
                xmlString = `<?xml version="1.0" encoding="UTF-8"?>
                    <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:gml="http://www.opengis.net/gml">
                        <xsd:complexType name="hfpType">
                            <xsd:complexContent>
                                <xsd:extension base="gml:AbstractFeatureType">
                                    <xsd:sequence>
                                        <xsd:element maxOccurs="1" minOccurs="0" name="OBJECTID" nillable="true" type="xsd:long"/>
                                        <xsd:element maxOccurs="1" minOccurs="0" name="UUID" nillable="true" type="xsd:string"/>
                                    </xsd:sequence>
                                </xsd:extension>
                            </xsd:complexContent>
                        </xsd:complexType>
                    </xsd:schema>`,
                xmlDoc = parser.parseFromString(xmlString, "text/xml");

            model.createSnippets = function (featureAttributesMap) {

                expect(featureAttributesMap).to.be.deep.equal([
                    {
                        name: "OBJECTID",
                        type: "long"
                    },
                    {
                        name: "UUID",
                        type: "string"
                    }
                ]);
            };

            model.parseResponse(xmlDoc);

        });

        it("should parse a XML with namespace (unformated)", function () {
            var parser = new DOMParser(),
                xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><xsd:schema xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:gml=\"http://www.opengis.net/gml\">" +
                    "<xsd:import namespace=\"http://www.opengis.net/gml\" schemaLocation=\"http://localhost:8080/geoserver/schemas/gml/2.1.2/feature.xsd\"/><xsd:complexType " +
                    "name=\"hfpType\"><xsd:complexContent><xsd:extension base=\"gml:AbstractFeatureType\"><xsd:sequence><xsd:element maxOccurs=\"1\" minOccurs=\"0\" " +
                    "name=\"OBJECTID\" nillable=\"true\" type=\"xsd:long\"/><xsd:element maxOccurs=\"1\" minOccurs=\"0\" name=\"UUID\" nillable=\"true\" type=\"xsd:string\"/>" +
                    "</xsd:sequence></xsd:extension></xsd:complexContent></xsd:complexType></xsd:schema>",
                xmlDoc = parser.parseFromString(xmlString, "text/xml");

            model.createSnippets = function (featureAttributesMap) {

                expect(featureAttributesMap).to.be.deep.equal([
                    {
                        name: "OBJECTID",
                        type: "long"
                    },
                    {
                        name: "UUID",
                        type: "string"
                    }
                ]);
            };

            model.parseResponse(xmlDoc);

        });

    });
});
