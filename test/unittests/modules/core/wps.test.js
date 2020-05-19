import Model from "@modules/core/wps.js";
import {expect} from "chai";

describe("core/WPS", function () {
    let model;

    before(function () {
        model = new Model();
    });

    describe("setXMLElement", function () {
        it("should return empty String if input strings are undefined", function () {
            expect(model.setXMLElement(undefined, undefined, undefined)).to.be.a("string").to.have.a.lengthOf(0);
        });
        it("should return String with \"hallo \" prepended to \"world\"", function () {
            expect(model.setXMLElement("world", "world", "hallo ")).to.have.string("hallo world");
        });
    });
    describe("buildXML", function () {
        const expectedOutput = "<xml><ows:Identifier>workbench.fmw</ows:Identifier>" +
                                "<wps:DataInputs>" +
                                "<wps:Input><ows:Identifier>test</ows:Identifier><wps:Data><wps:LiteralData>123</wps:LiteralData></wps:Data></wps:Input>" +
                                "</wps:DataInputs></xml>";

        it("should return empty String if input strings are undefined", function () {
            expect(model.buildXML(undefined, undefined, undefined, undefined)).to.be.a("string").to.have.a.lengthOf(0);
        });
        it("should return xml if input object is JSON ", function () {
            const identifier = "workbench.fmw",
                data = {"test": 123},
                xmlTemplate = "<xml><ows:Identifier></ows:Identifier><wps:DataInputs></wps:DataInputs></xml>",
                dataInputXmlTemplate = "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>";

            expect(model.buildXML(identifier, data, xmlTemplate, dataInputXmlTemplate)).to.have.string(expectedOutput);
        });
        it("should return xml if input object is object ", function () {
            const identifier = "workbench.fmw",
                data = {test: 123},
                xmlTemplate = "<xml><ows:Identifier></ows:Identifier><wps:DataInputs></wps:DataInputs></xml>",
                dataInputXmlTemplate = "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>";

            expect(model.buildXML(identifier, data, xmlTemplate, dataInputXmlTemplate)).to.have.string(expectedOutput);
        });
    });
    describe("buildUrl", function () {
        // eslint-disable-next-line no-unused-vars
        const restModel = new Backbone.Model({
            "id": "1001",
            "name": "Deegree WPS RZ2 Produktion",
            "url": "https://geodienste.hamburg.de/HH_WPS",
            "typ": "WPS"
        });

        it("return empty string if input is undefined", function () {
            expect(model.buildUrl(undefined)).to.be.a("string").to.have.a.lengthOf(0);
        });
    });
    describe("parseXmlToObject", function () {
        it("return empty object if input xml string is undefined", function () {
            expect(model.parseXmlToObject(undefined)).to.be.undefined;
        });
        it("return empty object if input xml string is empty", function () {
            expect(model.parseXmlToObject("")).to.be.undefined;
        });
        it("return empty object if input xml string is undefined and object is {}", function () {
            const xml = "<xml><data1>test</data1><data2>123</data2></wps:Input></xml>";

            expect(model.parseXmlToObject(xml)).to.deep.equal({data1: "test", data2: "123"});
        });
    });

});
