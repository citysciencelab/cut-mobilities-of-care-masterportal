import {expect} from "chai";
import sinon from "sinon";
import List from "@modules/core/modelList/list.js";
import TilesetLayerModel, {lastUpdatedSymbol} from "@modules/core/modelList/layer/tileset.js";
import {createDummyCesium3DTileContent} from "./getDummyCesiumClasses";

describe("core/modelList/layer/tileset", function () {
    let tilesetLayer,
        scene,
        clock;

    beforeEach(function () {
        tilesetLayer = new TilesetLayerModel({});
        scene = new Cesium.Scene({
            canvas: document.createElement("canvas"),
            creditContainer: document.createElement("div")
        });
        sinon.stub(Radio, "request").callsFake(function (channel, topic) {
            if (topic === "isMap3d") {
                return true;
            }
            else if (topic === "getMap3d") {
                return {
                    getCesiumScene () {
                        return scene;
                    }
                };
            }
            return null;
        });
        clock = sinon.useFakeTimers(Date.now());
    });

    afterEach(function () {
        sinon.restore();
    });

    describe("initialization", function () {
        it("should add listener to Map change event, and call toggleLayerOnMap on toggle", function () {
            const toggleLayerOnMap = sinon.spy(tilesetLayer, "toggleLayerOnMap");

            expect(toggleLayerOnMap.calledOnce).to.be.false;
            Radio.trigger("Map", "change", "3D");
            expect(toggleLayerOnMap.calledOnce).to.be.true;
        });
    });

    describe("prepareLayerObject", function () {
        it("should create Tileset", function () {
            tilesetLayer.prepareLayerObject();

            expect(tilesetLayer.get("tileSet")).to.be.an.instanceof(Cesium.Cesium3DTileset);
        });
    });

    describe("toggleLayerOnMap", function () {
        it("should add tileset to cesium primitiveCollection if isSelected is true", function () {
            tilesetLayer.collection = new List();
            tilesetLayer.prepareLayerObject();
            tilesetLayer.set("isSelected", true);
            expect(scene.primitives.contains(tilesetLayer.get("tileSet"))).to.be.true;
        });
    });

    describe("styleContent", function () {
        it("should set lastUpdatedSymbol on the content on first call", function () {
            const content = createDummyCesium3DTileContent({"id": "test"});

            expect(content[lastUpdatedSymbol]).to.be.undefined;
            tilesetLayer.styleContent(content);
            expect(content[lastUpdatedSymbol]).to.not.be.undefined;
        });

        it("should set the feature visibility to false if the feature id is in the hiddenObjects List", function () {
            const content = createDummyCesium3DTileContent({"id": "test"});

            tilesetLayer.styleContent(content);
            expect(content.getFeature().show).to.be.true;
            clock.tick(1);
            tilesetLayer.hideObjects(["test"]);
            clock.tick(1);
            tilesetLayer.styleContent(content);
            expect(content.getFeature().show).to.be.false;
        });
    });

    describe("hideObjects", function () {
        it("add the id to the hiddenObjects and create an empty Set", function () {
            tilesetLayer.hideObjects(["id"]);
            expect(tilesetLayer.hiddenObjects.id).to.be.an.instanceOf(Set);

        });
    });

    describe("showObjects", function () {
        it("should remove the id from the hiddenObjects List", function () {
            tilesetLayer.hideObjects(["id"]);
            expect(tilesetLayer.hiddenObjects.id).to.be.an.instanceOf(Set);
            tilesetLayer.showObjects(["id"]);
            expect(tilesetLayer.hiddenObjects.id).to.be.undefined;
        });
    });

    describe("combineOptions", function () {
        it("should combine config options with default options", function () {
            expect(tilesetLayer.combineOptions({a: 1, b: 2}, "url")).to.deep.equal({a: 1, b: 2, maximumScreenSpaceError: "6", url: "url/tileset.json"});
        });
        it("should filter url parameters", function () {
            expect(tilesetLayer.combineOptions({a: 1, b: 2}, "url?castToPoint=true")).to.deep.equal({a: 1, b: 2, maximumScreenSpaceError: "6", url: "url/tileset.json"});
        });
    });
});
