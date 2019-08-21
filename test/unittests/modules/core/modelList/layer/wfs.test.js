import WFSModel from "@modules/core/modelList/layer/wfs.js";
import {expect} from "chai";

describe("core/modelList/layer/wfs", function () {
    let WFSLayer;

    before(function () {
        WFSLayer = new WFSModel();
    });

    describe("checkVersion", function () {
        it("should return false for invalid version", function () {
            expect(WFSLayer.checkVersion("layerName", "layerId", "2.0.0", ["1.1.0"])).to.be.false;
        });
        it("should return false for empty version", function () {
            expect(WFSLayer.checkVersion("layerName", "layerId", "", ["1.1.0"])).to.be.false;
        });
        it("should return true for valid version and two allwoedVersions", function () {
            expect(WFSLayer.checkVersion("layerName", "layerId", "2.0.0", ["1.1.0", "2.0.0"])).to.be.true;
        });
        it("should return true for valid version and one allwoedVersions", function () {
            expect(WFSLayer.checkVersion("layerName", "layerId", "1.1.0", ["1.1.0"])).to.be.true;
        });
    });
});
