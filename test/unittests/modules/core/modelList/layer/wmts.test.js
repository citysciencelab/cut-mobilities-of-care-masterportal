import {expect} from "chai";
import sinon from "sinon";
import WMTSLayer from "@modules/core/modelList/layer/wmts.js";
import {get as getProjection} from "ol/proj";
import {getWidth} from "ol/extent";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import * as WMTSResult1 from "../../../../resources/testWMTSResponse1.xml";
import * as WMTSResult2 from "../../../../resources/testWMTSResponse2.xml";
import "@babel/polyfill";
import Preparser from "@modules/core/configLoader/preparser";
import ParametricURL from "@modules/core/parametricURL";
import {registerProjections} from "masterportalAPI/src/crs";
import Util from "@modules/core/util.js";
import TileLayer from "ol/layer/Tile";
import OlWMTSSource from "ol/source/WMTS.js";
import Map from "@modules/core/map";

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

describe("core/modelList/layer/wmts optionsFromCapabilities", function () {
    let model,
        legendURL,
        result;

    const tests = [
        {"id": "1", layerName: "nw_dtk_col", result: WMTSResult1},
        {"id": "2", layerName: "webatlasde", result: WMTSResult2}
    ];

    // instantiate util to request Radio channel
    new Util();

    before(async function () {
        new Preparser(null, {url: Config.portalConf});
        new ParametricURL();
        registerProjections();
        const parser = new WMTSCapabilities();

        new Map();

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

    describe("test createlegend success", () => {

        before(async function () {
            model.set("capabilitiesUrl", tests[0].result);
            model.set("optionsFromCapabilities", true);
            model.createLegendURL();
        });

        after(() => {
            model.unset("legendURL");
            legendURL = undefined;
        });

        it("legendURL should be valid url", () => {
            /**
            * checkURL for img format
            * @param {string} url the url to be checked
            * @returns {void}
            */
            function checkUrlImg (url) {
                let valid = false;

                if (url.toLowerCase().match("png|gif|jpg|jpeg")) {
                    valid = true;
                }
                return valid;
            }

            legendURL = model.get("legendURL");

            expect(legendURL).to.contain("http");

            expect(checkUrlImg(legendURL)).to.be.true;
        });
    });

    describe("test createlegend failure", () => {

        before(async function () {
            model.set("capabilitiesUrl", tests[1].result);
            model.set("layers", tests[1].layerName);
            model.set("optionsFromCapabilities", true);
            model.createLegendURL();
        });

        it("should be null", () => {
            legendURL = model.get("legendURL");
            expect(legendURL).to.be.null;
        });
    });
});
