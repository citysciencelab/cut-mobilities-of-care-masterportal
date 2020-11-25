import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsMapMarker";

import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";

const {placingPointMarker, removePointMarker, placingPolygonMarker, removePolygonMarker} = actions;

describe("src/modules/mapMarker/store/actionsMapMarker.js", () => {
    describe("placingPointMarker", () => {
        it("placingPointMarker if no styleListModel exist", done => {
            const payload = [10, 10],
                state = {
                    markerPoint: new VectorLayer({
                        name: "markerPoint",
                        source: new VectorSource(),
                        alwaysOnTop: true,
                        visible: false,
                        style: new Style()
                    })
                };

            testAction(placingPointMarker, payload, state, {}, [
                {type: "removePointMarker", dispatch: true}
            ], {}, done);
        });
    });

    describe("removePointMarker", () => {
        it("removePointMarker", done => {
            const state = {
                markerPoint: new VectorLayer({
                    name: "markerPoint",
                    source: new VectorSource(),
                    alwaysOnTop: true,
                    visible: false,
                    style: new Style()
                })
            };

            testAction(removePointMarker, null, state, {}, [
                {type: "Map/removeLayerFromMap", payload: state.markerPoint},
                {type: "clearMarker", payload: "markerPoint"},
                {type: "setVisibilityMarker", payload: {visbility: false, marker: "markerPoint"}}
            ], {}, done);
        });
    });

    describe("placingPolygonMarker", () => {
        it("placingPolygonMarker if no styleListModel exist", done => {
            const payload = {
                    wktcontent: [10, 10, 20, 20, 30, 30, 40, 40, 10, 10],
                    geometryType: "POLYGON"
                },
                state = {
                    markerPolygon: new VectorLayer({
                        name: "markerPolygon",
                        source: new VectorSource(),
                        alwaysOnTop: true,
                        visible: false,
                        style: new Style()
                    })
                };

            testAction(placingPolygonMarker, payload, state, {}, [
                {type: "removePolygonMarker", dispatch: true}
            ], {}, done);
        });
    });

    describe("removePolygonMarker", () => {
        it("removePolygonMarker", done => {
            const state = {
                markerPolygon: new VectorLayer({
                    name: "markerPolygon",
                    source: new VectorSource(),
                    alwaysOnTop: true,
                    visible: false,
                    style: new Style()
                })
            };

            testAction(removePolygonMarker, null, state, {}, [
                {type: "Map/removeLayerFromMap", payload: state.markerPolygon},
                {type: "clearMarker", payload: "markerPolygon"},
                {type: "setVisibilityMarker", payload: {visbility: false, marker: "markerPolygon"}}
            ], {}, done);
        });
    });
});
