import {expect} from "chai";

import mutations from "../../../store/mutationsMeasure";

const {addFeature, addOverlay, addUnlistener} = mutations;

describe("tools/measure/store/mutationsMeasure", function () {
    describe("addFeature", function () {
        it("adds LineString measurements to lines object by key", function () {
            const lines = {0: {}, 1: {}, 2: {}},
                state = {
                    selectedGeometry: "LineString",
                    lines
                };

            addFeature(state, {ol_uid: "id"});

            expect(state.lines).not.to.equal(lines);
            expect(state.lines).to.deep.equal({0: {}, 1: {}, 2: {}, id: {ol_uid: "id"}});
        });

        it("adds Polygon measurements to polygon object by key", function () {
            const polygons = {0: {}, 1: {}, 2: {}},
                state = {
                    selectedGeometry: "Polygon",
                    polygons
                };

            addFeature(state, {ol_uid: "id"});

            expect(state.polygons).not.to.equal(polygons);
            expect(state.polygons).to.deep.equal({0: {}, 1: {}, 2: {}, id: {ol_uid: "id"}});
        });
    });

    describe("addOverlay", function () {
        it("adds payload as last element to new spread array", function () {
            const overlays = [0, 1, 2],
                state = {overlays};

            addOverlay(state, 3);

            expect(state.overlays).not.to.equal(overlays);
            expect(state.overlays).to.deep.equal([0, 1, 2, 3]);
        });
    });

    describe("addUnlistener", function () {
        it("adds payload as last element to new spread array", function () {
            const unlisteners = [0, 1, 2],
                state = {unlisteners};

            addUnlistener(state, 3);

            expect(state.unlisteners).not.to.equal(unlisteners);
            expect(state.unlisteners).to.deep.equal([0, 1, 2, 3]);
        });
    });
});
