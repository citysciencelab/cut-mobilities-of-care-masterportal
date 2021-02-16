import WPS from "../../wps.js";
import {expect} from "chai";

describe("api/WPS", function () {
    describe("setXMLElement", function () {
        it("should return empty String if input strings are undefined", function () {
            expect(WPS.setXMLElement(undefined, undefined, undefined)).to.be.a("string").to.have.a.lengthOf(0);
        });
        it("should return String with \"hallo \" prepended to \"world\"", function () {
            expect(WPS.setXMLElement("world", "world", "hallo ")).to.have.string("hallo world");
        });
    });
    describe("buildXML", function () {
        const expectedOutput = "<xml><ows:Identifier>workbench.fmw</ows:Identifier>" +
                                "<wps:DataInputs>" +
                                "<wps:Input><ows:Identifier>test</ows:Identifier><wps:Data><wps:LiteralData>123</wps:LiteralData></wps:Data></wps:Input>" +
                                "</wps:DataInputs></xml>";

        it("should return empty String if input strings are undefined", function () {
            expect(WPS.buildXML(undefined, undefined, undefined, undefined)).to.be.a("string").to.have.a.lengthOf(0);
        });
        it("should return xml if input object is JSON ", function () {
            const identifier = "workbench.fmw",
                data = {"test": 123},
                xmlTemplate = "<xml><ows:Identifier></ows:Identifier><wps:DataInputs></wps:DataInputs></xml>",
                dataInputXmlTemplate = "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>";

            expect(WPS.buildXML(identifier, data, xmlTemplate, dataInputXmlTemplate)).to.have.string(expectedOutput);
        });
        it("should return xml if input object is object ", function () {
            const identifier = "workbench.fmw",
                data = {test: 123},
                xmlTemplate = "<xml><ows:Identifier></ows:Identifier><wps:DataInputs></wps:DataInputs></xml>",
                dataInputXmlTemplate = "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>";

            expect(WPS.buildXML(identifier, data, xmlTemplate, dataInputXmlTemplate)).to.have.string(expectedOutput);
        });
    });
    describe("buildUrl", function () {
        it("return empty string if input is undefined", function () {
            expect(WPS.buildUrl(undefined)).to.be.a("string").to.have.a.lengthOf(0);
        });
    });
    describe("parseXmlToObject", function () {
        it("return empty object if input xml string is undefined", function () {
            expect(WPS.parseXmlToObject(undefined)).to.be.undefined;
        });
        it("return empty object if input xml string is empty", function () {
            expect(WPS.parseXmlToObject("")).to.be.undefined;
        });
        it("return empty object if input xml string is a HTMLDocument", function () {
            const documentString = "<xml><data1>test</data1><data2>123</data2></xml>",
                htmlDocument = new DOMParser().parseFromString(documentString, "text/xml");

            expect(WPS.parseXmlToObject(htmlDocument)).to.deep.equal({data1: "test", data2: "123"});
        });
    });

});
