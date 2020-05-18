import {expect} from "chai";
import sinon from "sinon";
import TerrainLayerModel from "@modules/core/modelList/layer/terrain.js";

describe("core/modelList/layer/terrain", function () {
    let terrainLayer,
        scene;

    beforeEach(function () {
        terrainLayer = new TerrainLayerModel({});
        scene = new Cesium.Scene({
            canvas: document.createElement("canvas"),
            creditContainer: document.createElement("div")
        });
        scene.globe = new Cesium.Globe();
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
            const toggleLayerOnMap = sinon.spy(terrainLayer, "toggleLayerOnMap");

            expect(toggleLayerOnMap.calledOnce).to.be.false;
            Radio.trigger("Map", "change", "3D");
            expect(toggleLayerOnMap.calledOnce).to.be.true;
        });
    });

    describe("prepareLayerObject", function () {
        it("should create Cesium TerrainProvider", function () {
            terrainLayer.prepareLayerObject();

            expect(terrainLayer.get("terrainProvider")).to.be.an.instanceof(Cesium.CesiumTerrainProvider);
        });
    });

    describe("toggleLayerOnMap", function () {
        it("should set created cesium TerrainProvider if layer is active", function () {
            terrainLayer.prepareLayerObject();
            terrainLayer.set("isVisibleInMap", true, {silent: true});
            terrainLayer.toggleLayerOnMap();

            expect(scene.terrainProvider === terrainLayer.get("terrainProvider")).to.be.true;
        });

        it("should set default Ellipsoid TerrainProvider if layer is inactive", function () {
            terrainLayer.prepareLayerObject();
            terrainLayer.set("isVisibleInMap", false, {silent: true});
            terrainLayer.toggleLayerOnMap();

            expect(scene.terrainProvider).to.be.an.instanceof(Cesium.EllipsoidTerrainProvider);
        });
    });
});
