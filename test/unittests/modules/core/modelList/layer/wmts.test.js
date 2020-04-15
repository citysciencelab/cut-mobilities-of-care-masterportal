import {expect} from "chai";
import sinon from "sinon";
import WMTSLayer from "@modules/core/modelList/layer/wmts.js";
import {get as getProjection} from "ol/proj";
import {getWidth} from "ol/extent";

describe("core/modelList/layer/", function () {
    let wmts;

    before(function () {
        wmts = new WMTSLayer();
    });

    afterEach(function () {
        wmts = new WMTSLayer();
    });

    describe("createLayerSource", function () {
        before(function () {
            wmts.set("coordinateSystem", "EPSG:3857");
            wmts.set("origin", [-20037508.3428, 20037508.3428]);
            wmts.set("resLength", "20");
            wmts.set("transparent", false);
        });

        it("should create the source for the layer", function () {
            wmts.createLayerSource();

            expect(wmts.attributes).to.have.property("layerSource");
            expect(typeof wmts.attributes.layerSource).to.equal("object");
        });
    });

    describe("createLegendURL", function () {
        before(function () {
            sinon.stub(console, "error");
        });

        after(function () {
            sinon.restore();
        });

        it("should log an error on the console if the legendURL is not set", function () {
            wmts.createLegendURL();

            expect(console.error.calledOnce).to.be.true;
            expect(console.error.calledWith("WMTS: No legendURL is specified for the layer!")).to.be.true;
        });
    });

    describe("generateArrays", function () {
        it("should fill the arrays resolutions and matrixIds with numbers", function () {
            const size = getWidth(getProjection("EPSG:3857").getExtent()) / 256,
                resLength = 20,
                resolutions = new Array(resLength),
                matrixIds = new Array(resLength);

            wmts.generateArrays(resolutions, matrixIds, resLength, size);

            resolutions.forEach((element, index) => {
                expect(typeof element).to.equal("number");
                expect(resolutions[index]).to.equal(size / Math.pow(2, index));
            });
            matrixIds.forEach((id, index) => {
                expect(typeof id).to.equal("number");
                expect(matrixIds[index]).to.equal(index);
            });
        });
    });

    describe("getExtent", function () {

        beforeEach(function () {
            wmts.set("coordinateSystem", "EPSG:3857");
        });

        it("should return the user-set extent if given for the layer", function () {
            const extent = [510000.0, 5850000.0, 625000.4, 6000000.0];

            wmts.set("extent", extent);

            expect(wmts.getExtent()).to.equal(extent);
        });

        it("should return the extent of the projection if the user has not set an extent for the layer", function () {
            const projectionExtent = getProjection("EPSG:3857").getExtent();

            expect(wmts.getExtent()).to.equal(projectionExtent);
        });
    });
});
