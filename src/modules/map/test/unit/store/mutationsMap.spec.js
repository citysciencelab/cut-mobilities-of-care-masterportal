import {expect} from "chai";
import sinon from "sinon";
import mutations from "../../../store/mutationsMap";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

const {setCenter, addLayerToMap, removeLayerFromMap} = mutations;

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

    describe("addLayerToMap", () => {
        it("add a layer to the map", () => {
            const state = {
                    map: new Map()
                },
                layer = new VectorLayer({
                    name: "layer123",
                    source: new VectorSource(),
                    visible: false
                });

            addLayerToMap(state, layer);

            expect(state.map.getLayers().getLength()).to.equals(1);
            expect(state.map.getLayers().getArray()[0].get("name")).to.equals("layer123");
        });
    });

    describe("removeLayerFromMap", () => {
        it("removes an layer from the map", () => {
            const layer = new VectorLayer({
                    name: "layer123",
                    source: new VectorSource(),
                    visible: false
                }),
                state = {
                    map: new Map({
                        layers: [
                            layer
                        ]
                    })
                };

            expect(state.map.getLayers().getLength()).to.equals(1);
            expect(state.map.getLayers().getArray()[0].get("name")).to.equals("layer123");

            removeLayerFromMap(state, layer);
            expect(state.map.getLayers().getLength()).to.equals(0);
        });
    });
});
