import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actions/actionsMap.js";

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
                rootGetters = {
                    "Tools/Gfi/isActive": true
                },
                dispatch = sinon.spy(),
                commit = sinon.spy(),
                obj = {
                    coordinate: [4, 56],
                    pixel: [12, 99]
                };

            actions.updateClick({commit, getters, dispatch, rootGetters}, obj);
            expect(commit.calledTwice).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.args[0]).to.include.members(["collectGfiFeatures"]);
        });
    });
});
