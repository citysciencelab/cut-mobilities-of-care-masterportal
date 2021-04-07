import {expect} from "chai";
import sinon from "sinon";
import {MapMode} from "../../../store/enums";
import actions from "../../../store/actions/actionsMap.js";

describe("src/modules/map/store/actions/actionsMap.js", () => {
    describe("updateClick: Listener for click on the map", () => {
        it("commits setClickCoord and setClickPixel in MODE_2D", () => {
            const getters = {
                    mapMode: MapMode.MODE_2D
                },
                rootGetters = {
                    "Tools/Gfi/active": false
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
                    mapMode: MapMode.MODE_3D
                },
                rootGetters = {
                    "Tools/Gfi/active": false
                },
                commit = sinon.spy(),
                obj = {
                    pickedPosition: [4, 56],
                    position: {
                        x: 12,
                        y: 99
                    },
                    map3d: "map3d"
                };

            actions.updateClick({commit, getters, rootGetters}, obj);
            expect(commit.calledThrice).to.be.true;
            expect(commit.args).to.deep.equal([
                ["setClickCoord", [4, 56]],
                ["setClickPixel", [12, 99]],
                ["setMap3d", "map3d"]
            ]);
        });

        it("commits setClickCoord, setClickPixel and setFeaturesAtCoordinate if gfi tool is active", () => {
            const getters = {
                    mapMode: MapMode.MODE_2D
                },
                rootGetters = {
                    "Tools/Gfi/active": true
                },
                dispatch = sinon.spy(),
                commit = sinon.spy(),
                obj = {
                    coordinate: [4, 56],
                    pixel: [12, 99]
                };

            actions.updateClick({commit, getters, dispatch, rootGetters}, obj);
            expect(commit.calledThrice).to.be.true;
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.args[0]).to.include.members(["MapMarker/removePolygonMarker"]);
            expect(dispatch.args[1]).to.include.members(["collectGfiFeatures"]);
        });
    });

    describe("collectGfiFeatures", () => {
        it("commits setGfiFeature", async () => {
            const getters = {
                    clickCoord: sinon.spy(),
                    mapMode: MapMode.MODE_2D,
                    visibleWmsLayerList: {
                        filter: function () {
                            return [];
                        }
                    },
                    resolution: sinon.spy(),
                    projection: sinon.spy(),
                    gfiFeaturesAtPixel: []
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
                    "Tools/Gfi/active": true
                },
                commit = sinon.spy(),
                dispatch = sinon.spy(),
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

            actions.updateClick({getters, commit, dispatch, rootGetters}, obj);
            expect(commit.calledThrice).to.be.true;
            expect(commit.args[1]).to.include.members(["setClickPixel"]);
        });
    });
});
