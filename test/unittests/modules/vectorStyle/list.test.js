import {expect} from "chai";
import List from "@modules/vectorStyle/list";


describe("vectorStyleList", function () {
    let list;

    before(function () {
        list = new List();
    });

    describe("getStyleIdsFromTools", function () {
        it("should return empty array for undefined as input", function () {
            expect(list.getStyleIdsFromTools(undefined)).to.deep.equal([]);
        });
        it("should return empty array for empty array as input", function () {
            expect(list.getStyleIdsFromTools([])).to.deep.equal([]);
        });
        it("should return array with styleIds for tool with styleId as string", function () {
            const tools = [
                {
                    styleId: "1"
                }
            ];

            expect(list.getStyleIdsFromTools(tools)).to.deep.equal(["1"]);
        });
        it("should return array with styleIds for tool with styleId as array", function () {
            const tools = [
                {
                    styleId: ["1", "2", "3"]
                }
            ];

            expect(list.getStyleIdsFromTools(tools)).to.deep.equal(["1", "2", "3"]);
        });
        it("should return array with styleIds for tool with styleId as array of objects", function () {
            const tools = [
                {
                    styleId: [{id: "1"}, {id: "2"}, {id: "3"}]
                }
            ];

            expect(list.getStyleIdsFromTools(tools)).to.deep.equal(["1", "2", "3"]);
        });
    });
    describe("getStyleIdsFromLayers", function () {
        it("should return empty array for undefined as input", function () {
            expect(list.getStyleIdsFromLayers(undefined)).to.deep.equal([]);
        });
        it("should return empty array for empty array as input", function () {
            expect(list.getStyleIdsFromLayers([])).to.deep.equal([]);
        });
        it("should return array with styleIds for tool with styleId as string", function () {
            const layers = [
                {
                    typ: "WFS",
                    styleId: "1"
                },
                {
                    typ: "GeoJSON",
                    styleId: "2"
                },
                {
                    typ: "SensorThings",
                    styleId: "3"
                },
                {
                    typ: "GROUP",
                    children: [
                        {
                            styleId: "4"
                        },
                        {
                            styleId: "5"
                        },
                        {
                            styleId: "6"
                        }
                    ]
                }
            ];

            expect(list.getStyleIdsFromLayers(layers)).to.deep.equal(["1", "2", "3", "4", "5", "6"]);
        });
    });
});
