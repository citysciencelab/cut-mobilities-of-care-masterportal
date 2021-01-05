import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsMapMarker";

import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";

const {
    placingPointMarker,
    removePointMarker,
    placingPolygonMarker,
    removePolygonMarker,
    activateByUrlParam
} = actions;

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
            const payload = new Feature({
                    geometry: new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]])
                }),
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

    describe("activateByUrlParam", () => {
        it("activateByUrlParam marker=565874,5934140", done => {
            const rootState = {
                queryParams: {
                    "marker": "565874,5934140"
                }
            };

            testAction(activateByUrlParam, null, {}, rootState, [
                {type: "placingPointMarker", payload: [565874, 5934140], dispatch: true}
            ], {}, done);
        });
        it("activateByUrlParam no marker", done => {
            const rootState = {
                queryParams: {
                }
            };

            testAction(activateByUrlParam, null, {}, rootState, [], {}, done);
        });
    });
});
