import {expect} from "chai";
import sinon from "sinon";
import mutations from "../../../store/mutationsMap";

const {setCenter} = mutations;

describe("src/modules/map/store/mutationsMap.js", () => {
    describe("setCenter", () => {
        it("should set the center", () => {
            const state = {
                center: [0, 7],
                map: {
                    getView: function () {
                        return {
                            setCenter: sinon.spy()
                        };
                    }
                }
            };

            setCenter(state, [3, 5]);
            expect(state.center).to.deep.equal([3, 5]);
        });

        it("should not set the center, if the coordinate (['3', 5]) has the wrong data type", () => {
            const state = {
                center: [0, 7],
                map: {
                    getView: function () {
                        return {
                            setCenter: sinon.spy()
                        };
                    }
                }
            };

            setCenter(state, ["3", 5]);
            expect(state.center).to.deep.equal([0, 7]);
        });

        it("should not set the center, if the coordinate ([3, '5']) has the wrong data type", () => {
            const state = {
                center: [0, 7],
                map: {
                    getView: function () {
                        return {
                            setCenter: sinon.spy()
                        };
                    }
                }
            };

            setCenter(state, [3, "5"]);
            expect(state.center).to.deep.equal([0, 7]);
        });

        it("should not set the center, if the coordinate is not an array", () => {
            const state = {
                center: [0, 7],
                map: {
                    getView: function () {
                        return {
                            setCenter: sinon.spy()
                        };
                    }
                }
            };

            setCenter(state, {3: "5"});
            expect(state.center).to.deep.equal([0, 7]);
        });

        it("should not set the center, if the length of the coordinate is greater than two", () => {
            const state = {
                center: [0, 7],
                map: {
                    getView: function () {
                        return {
                            setCenter: sinon.spy()
                        };
                    }
                }
            };

            setCenter(state, [0, 3, 3]);
            expect(state.center).to.deep.equal([0, 7]);
        });

        it("should not set the center, if the length of the coordinate is lower than two", () => {
            const state = {
                center: [0, 7],
                map: {
                    getView: function () {
                        return {
                            setCenter: sinon.spy()
                        };
                    }
                }
            };

            setCenter(state, [8]);
            expect(state.center).to.deep.equal([0, 7]);
        });
    });
});
