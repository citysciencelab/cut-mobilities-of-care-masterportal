import getDrawTypeByGeometryType from "../../../utils/getDrawTypeByGeometryType";

import {expect} from "chai";

describe("src/modules/tools/draw/utils/getDrawTypeByGeometryType.js", () => {
    it("should return null if no drawTypeOption is offered", () => {
        expect(getDrawTypeByGeometryType("geometryType", undefined)).to.be.null;
        expect(getDrawTypeByGeometryType("geometryType", null)).to.be.null;
        expect(getDrawTypeByGeometryType("geometryType", "string")).to.be.null;
        expect(getDrawTypeByGeometryType("geometryType", 1234)).to.be.null;
        expect(getDrawTypeByGeometryType("geometryType", false)).to.be.null;
        expect(getDrawTypeByGeometryType("geometryType", true)).to.be.null;
        expect(getDrawTypeByGeometryType("geometryType", [])).to.be.null;
        expect(getDrawTypeByGeometryType("geometryType", {})).to.be.null;
    });
    it("should return the first entry of drawTypeOption if no entry matches the given geometryType", () => {
        const geometryType = "unknown GeometryType",
            drawTypeOptions = [
                {geometry: "something different"},
                {geometry: "somethinig else", somePayload: "somePayload", altGeometry: ["some alternative"]},
                {geometry: "something totaly different"}
            ],
            result = getDrawTypeByGeometryType(geometryType, drawTypeOptions),
            expected = {geometry: "something different"};

        expect(result).to.deep.equal(expected);
    });

    it("should return the first matching drawType option", () => {
        const geometryType = "geometryType",
            drawTypeOptions = [
                {geometry: "something different"},
                {geometry: "geometryType", somePayload: "somePayload"},
                {geometry: "geometryType", someOtherPayload: "someOtherPayload"},
                {geometry: "something totaly different"}
            ],
            result = getDrawTypeByGeometryType(geometryType, drawTypeOptions),
            expected = {geometry: "geometryType", somePayload: "somePayload"};

        expect(result).to.deep.equal(expected);
    });
    it("should return the matching drawType option and recognize the alternative geometry", () => {
        const geometryType = "geometryType",
            drawTypeOptions = [
                {geometry: "something different"},
                {geometry: "somethinig else", somePayload: "somePayload", altGeometry: ["geometryType"]},
                {geometry: "something totaly different"}
            ],
            result = getDrawTypeByGeometryType(geometryType, drawTypeOptions),
            expected = {geometry: "somethinig else", somePayload: "somePayload", altGeometry: ["geometryType"]};

        expect(result).to.deep.equal(expected);
    });
});
