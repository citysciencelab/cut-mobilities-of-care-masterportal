import {expect} from "chai";
import Model from "@modules/core/wps.js";

describe("core/WPS", function () {
    var model;

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
        var expectedOutput = "<xml><ows:Identifier>workbench.fmw</ows:Identifier>" +
                                "<wps:DataInputs>" +
                                "<wps:Input><ows:Identifier>test</ows:Identifier><wps:Data><wps:LiteralData>123</wps:LiteralData></wps:Data></wps:Input>" +
                                "</wps:DataInputs></xml>";

        it("should return empty String if input strings are undefined", function () {
            expect(model.buildXML(undefined, undefined, undefined, undefined)).to.be.a("string").to.have.a.lengthOf(0);
        });
        it("should return xml if input object is JSON ", function () {
            var identifier = "workbench.fmw",
                data = {"test": 123},
                xmlTemplate = "<xml><ows:Identifier></ows:Identifier><wps:DataInputs></wps:DataInputs></xml>",
                dataInputXmlTemplate = "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>";

            expect(model.buildXML(identifier, data, xmlTemplate, dataInputXmlTemplate)).to.have.string(expectedOutput);
        });
        it("should return xml if input object is object ", function () {
            var identifier = "workbench.fmw",
                data = {test: 123},
                xmlTemplate = "<xml><ows:Identifier></ows:Identifier><wps:DataInputs></wps:DataInputs></xml>",
                dataInputXmlTemplate = "<wps:Input><ows:Identifier></ows:Identifier><wps:Data><wps:LiteralData></wps:LiteralData></wps:Data></wps:Input>";

            expect(model.buildXML(identifier, data, xmlTemplate, dataInputXmlTemplate)).to.have.string(expectedOutput);
        });
    });
    describe("buildUrl", function () {
        var restModel = new Backbone.Model({
            "id": "1001",
            "name": "Deegree WPS RZ2 Produktion",
            "url": "https://geodienste.hamburg.de/HH_WPS",
            "typ": "WPS"
        });

        it("return empty string if inputs are undefined", function () {
            expect(model.buildUrl(undefined, undefined)).to.be.a("string").to.have.a.lengthOf(0);
        });
        it("return url string with default version( version not set in restModel)", function () {
            expect(model.buildUrl("test.fmw", restModel)).to.be.a("string").to.have.string("version=1.1.0");
        });
        it("return url string with given version( version set in restModel)", function () {
            restModel.set("version", "2.0.0");
            expect(model.buildUrl("test.fmw", restModel)).to.be.a("string").to.have.string("version=2.0.0");
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
            var xml = "<xml><data1>test</data1><data2>123</data2></wps:Input></xml>";

            expect(model.parseXmlToObject(xml)).to.deep.equal({data1: "test", data2: "123"});
        });
    });

});
