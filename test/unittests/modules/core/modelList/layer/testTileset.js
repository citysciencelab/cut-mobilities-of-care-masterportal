import {expect} from "chai";
import sinon from "sinon";
import TilesetLayerModel from "@modules/core/modelList/layer/tileset.js";
import List from "@modules/core/modelList/list.js";

describe("core/modelList/layer/tileset", function () {
    var tilesetLayer,
        scene;

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
});
