import "core-js/stable";
import "regenerator-runtime/runtime";
import {expect} from "chai";
import WMTSLayer from "@modules/core/modelList/layer/wmts.js";
import {get as getProjection} from "ol/proj";
import {getWidth} from "ol/extent";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import OlWMTSSource from "ol/source/WMTS.js";
import TileLayer from "ol/layer/Tile";
import * as WMTSResult1 from "../../../../resources/testWMTSResponse1.xml";
import * as WMTSResult2 from "../../../../resources/testWMTSResponse2.xml";

describe("core/modelList/layer/wmts", function () {
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

describe("core/modelList/layer/wmts optionsFromCapabilities", function () {
    let model,
        result;

    const tests = [
        {"id": "1", layerName: "nw_dtk_col", result: WMTSResult1},
        {"id": "2", layerName: "webatlasde", result: WMTSResult2}
    ];

    before(async function () {
        const parser = new WMTSCapabilities();

        model = new WMTSLayer();
        model.fetchWMTSCapabilities = async function (WMTSResult) {
            return parser.read(WMTSResult);
        };
    });

    describe("test WMTS Capabilities methods", function () {

        before(async function () {
            result = await model.fetchWMTSCapabilities(tests[0].result);
        });

        it("fetchWMTSCapabilities should return an object", () => {
            expect(result).to.be.an("object");
        });
    });

    describe("test createLayerSource function", () => {
        before(async () => {
            model.set("capabilitiesUrl", tests[0].result);
            model.set("layers", tests[0].layerName);
            model.set("optionsFromCapabilities", true);

            result = await model.createLayerSource();
        });

        after(() => {
            result = null;
        });

        it("should exist", () => {
            expect(model.createLayerSource).to.be.a("function");
        });

        it("should create valid wmts options", function () {
            expect(model.get("options")).to.be.an("object");
        });

        it("should create a valid wmts source", () => {
            expect(model.get("layerSource")).to.be.an.instanceOf(OlWMTSSource);
        });
    });

    describe("test createLayerFunction", () => {
        before(async () => {
            model.set("capabilitiesUrl", tests[0].result);
            model.set("layers", tests[0].layerName);
            model.set("optionsFromCapabilities", true);

            result = await model.createLayerSource();
        });

        after(() => {
            result = null;
        });

        it("function exist", function () {
            expect(model.createLayer).to.be.a("function");
        });

        it("should create valid WMTS-Layer", function () {
            model.set("typ", "WMTS");
            model.set("layers", tests[0].layerName);
            model.createLayer();

            expect(model.get("layer")).to.be.an.instanceOf(TileLayer);
        });
    });
});
