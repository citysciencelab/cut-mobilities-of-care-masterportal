import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actions/actionsMap.js";
// import getFeatureInfoUrls from "../../../../../src/api/wmsGetFeatureInfo";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import View from "ol/View";

// get data from https://openlayers.org/en/latest/examples/getfeatureinfo-tile.html
const wmsSource = new TileWMS({
        url: "https://ahocevar.com/geoserver/wms",
        params: {"LAYERS": "ne:ne", "TILED": true},
        serverType: "geoserver",
        crossOrigin: "anonymous"
    }),
    wmsLayer = new TileLayer({
        source: wmsSource,
        INFO_FORMAT: "text/html"
    }),
    map = new Map({
        layers: [wmsLayer],
        view: new View({
            center: [0, 0],
            zoom: 1
        })
    });

describe("actionsMap", function () {
    describe("updateClick: Listener for click on the map", () => {
        it("commits setClickCoord and setClickPixel in MODE_2D", () => {
            const getters = {
                    // MODE_2D
                    mapMode: 0
                },
                rootGetters = {
                    "Tools/Gfi/isActive": false
                },
                commit = sinon.spy(),
                obj = {
                    coordinate: [4, 56],
                    pixel: [12, 99]
                };

            actions.updateClick({commit, getters, rootGetters}, obj);
            expect(commit.calledTwice).to.be.true;
            expect(commit.args).to.deep.equal([
                ["setClickCoord", [4, 56]],
                ["setClickPixel", [12, 99]]
            ]);
        });

        it("commits setClickCoord and setClickPixel in MODE_3D", () => {
            const getters = {
                    // MODE_3D
                    mapMode: 1
                },
                rootGetters = {
                    "Tools/Gfi/isActive": false
                },
                commit = sinon.spy(),
                obj = {
                    pickedPosition: [4, 56],
                    position: {
                        x: 12,
                        y: 99
                    }
                };

            actions.updateClick({commit, getters, rootGetters}, obj);
            expect(commit.calledTwice).to.be.true;
            expect(commit.args).to.deep.equal([
                ["setClickCoord", [4, 56]],
                ["setClickPixel", [12, 99]]
            ]);
        });

        it("commits setClickCoord, setClickPixel and setFeaturesAtCoordinate if gfi tool is active", () => {
            const getters = {
                    mapMode: 0
                },
                view = {
                    getResolution: sinon.stub(),
                    getProjection: sinon.stub()
                },
                layers = {
                    getArray: function () {
                        return [];
                    }
                },
                rootGetters = {
                    "Tools/Gfi/isActive": true
                },
                dispatch = sinon.spy(),
                commit = sinon.spy(),
                obj = {
                    coordinate: [4, 56],
                    pixel: [12, 99],
                    map: {
                        getView: function () {
                            return view;
                        },
                        getLayers: function () {
                            return layers;
                        },
                        getFeaturesAtPixel: sinon.stub()
                    }
                };

            actions.updateClick({commit, getters, dispatch, rootGetters}, obj);
            expect(commit.calledTwice).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.args[0]).to.include.members(["collectGfiFeatures"]);
        });
    });

    // describe("getFeatureInfoUrls", () => {
    //     it("returns an array with urls for the GFI request for all visible wms layer", () => {
    //         const urls = getFeatureInfoUrls(map, [4, 56]);

    //         expect(urls).to.be.an("array");
    //         expect(urls).to.have.lengthOf(1);
    //         expect(urls[0]).to.equal("https://ahocevar.com/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=ne%3Ane&LAYERS=ne%3Ane&TILED=true&I=0&J=255&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&STYLES=&BBOX=0%2C0%2C20037508.342789244%2C20037508.342789244");
    //     });

    //     it("returns an empty array if no wms layer is visible", () => {
    //         wmsLayer.setVisible(false);
    //         const urls = getFeatureInfoUrls(map, [4, 56]);

    //         expect(urls).to.be.an("array");
    //         expect(urls).to.be.empty;
    //     });
    // });
});
