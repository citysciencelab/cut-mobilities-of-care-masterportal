/**/
import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsKmlImport";
import importedState from "../../../store/stateKmlImport";
import rawSources from "../../ressources/rawSources.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import * as crs from "masterportalAPI/src/crs";

const
    {activateByUrlParam, importKML, initialize, setActive, setSelectedFiletype} = actions,
    namedProjections = [
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ];

before(() => {
    crs.registerProjections(namedProjections);
    
    i18next.init({
        lng: "cimode",
        debug: false
    });
});

describe("actionsKmlImport", function () {
    describe("activateByUrlParam", function () {
        it("activateByUrlParam  isinitopen=kmlimport", done => {
            const rootState = {
                queryParams: {
                    "isinitopen": "kmlimport"
                }
            };

            testAction(activateByUrlParam, null, {active: false}, rootState, [
                {type: "active", payload: true}
            ], {}, done);
        });
        it("activateByUrlParam no isinitopen", done => {
            const rootState = {
                queryParams: {
                }
            };

            testAction(activateByUrlParam, null, {active: false}, rootState, [], {}, done);
        });
    });

    describe("importKML", function () {
        it("Kml file should add some features to the current draw layer", done => {
            const
                source = new VectorSource(),
                layer = new VectorLayer({
                    name: name,
                    source: source,
                    alwaysOnTop: true
                }),
                payload = {
                    layer: layer,
                    raw: rawSources[0],                    
                    filename: "TestFile1.kml"
                };
                
            testAction(importKML, payload, importedState, {}, [
                {
                    type: "Alerting/addSingleAlert",
                    payload: {
                        category: i18next.t("common:modules.alerting.categories.error"),
                        content: i18next.t("common:modules.tools.kmlImport.alertingMessages.missingFormat")
                    },
                    dispatch: true
                }
                
                //{type: "changedPosition", payload: payload.coordinate, dispatch: true},
                //{type: "setUpdatePosition", payload: false}
            ], {}, done);                
        });
    });





    /*
    describe("positionClicked", function () {
        it("positionClicked", done => {
            const payload = {
                    coordinate: [1000, 2000]
                },
                state = {
                    updatePosition: true,
                    positionMapProjection: [300, 300]
                };

            testAction(positionClicked, payload, state, {}, [
                {type: "setPositionMapProjection", payload: payload.coordinate},
                {type: "changedPosition", payload: payload.coordinate, dispatch: true},
                {type: "setUpdatePosition", payload: false}
                // TODO add testing showMapMarker if MapMarker is migrated
            ], {}, done);
        });
    });
    describe("newProjectionSelected", function () {
        it("newProjectionSelected", done => {
            const state = {
                currentSelection: "projection 2",
                projections: [
                    {name: "projection 1", projName: "longlat"},
                    {name: "projection 2", projName: "longlat"}
                ]
            };

            testAction(newProjectionSelected, null, state, {}, [
                {type: "setCurrentProjectionName", payload: "projection 2"},
                {type: "setCurrentProjection", payload: {name: "projection 2"}}
            ], {getProjectionByName: () => {
                return {name: "projection 2"};
            }}, done);
        });
    });
    describe("changedPosition", function () {
        const rootState = {
                Map: {
                    map: {}
                }
            },
            proj1 = {name: "projection 1", projName: "longlat"},
            proj2 = {name: "projection 2", projName: "longlat"},
            state = {
                currentSelection: "projection 2",
                projections: [proj1, proj2],
                currentProjection: proj2,
                positionMapProjection: [300, 400]
            };

        it("changedPosition will call adjustPosition", done => {
            const payload = {
                position: [100, 200],
                targetProjection: proj2
            };

            testAction(changedPosition, null, state, rootState, [
                {type: "adjustPosition", payload: payload, dispatch: true}
            ], {getTransformedPosition: () => {
                return [100, 200];
            }}, done);
        });
        it("changedPosition will not call adjustPosition", done => {
            testAction(changedPosition, null, state, rootState, [],
                {getTransformedPosition: () => {
                    return null;
                }}, done);
        });
    });
    describe("adjustPosition", function () {
        const rootState = {
                Map: {
                    map: {}
                }
            },
            proj1 = {name: "projection 1", projName: "utm"},
            proj2 = {name: "projection 2", projName: "longlat"};

        it("adjustPosition sets coordinate fields - longlat", done => {
            const payload = {
                position: [100, 200],
                targetProjection: proj2
            };

            testAction(adjustPosition, payload, {}, rootState, [
                {type: "setCoordinatesEastingField", payload: "160° 00′ 00″"},
                {type: "setCoordinatesNorthingField", payload: "100° 00′ 00″ E"}
            ], {}, done);
        });
        it("adjustPosition sets coordinate fields - utm", done => {
            const payload = {
                position: [100, 200],
                targetProjection: proj1
            };

            testAction(adjustPosition, payload, {}, rootState, [
                {type: "setCoordinatesEastingField", payload: "100.00"},
                {type: "setCoordinatesNorthingField", payload: "200.00"}
            ], {}, done);
        });
        it("adjustPosition sets coordinate fields - no projection and position does nothing", done => {
            const payload = {
                position: [],
                targetProjection: null
            };

            testAction(adjustPosition, payload, {}, rootState, [], {}, done);
        });
        it("adjustPosition sets coordinate fields - no position does not fail", done => {
            const payload = {
                position: null,
                targetProjection: proj1
            };

            testAction(adjustPosition, payload, {}, rootState, [], {}, done);
        });
        it("adjustPosition sets coordinate fields - empty position does not fail", done => {
            const payload = {
                position: [],
                targetProjection: proj1
            };

            testAction(adjustPosition, payload, {}, rootState, [], {}, done);
        });
    });
    describe("setCoordinates", function () {
        it("setCoordinates updates position", done => {
            const state = {
                    updatePosition: true
                },
                position = [100, 200],
                payload = {
                    coordinate: position
                };

            testAction(setCoordinates, payload, state, {}, [
                {type: "setPositionMapProjection", payload: position},
                {type: "changedPosition", payload: undefined, dispatch: true}
            ], {}, done);
        });
        it("setCoordinates not updates position", done => {
            const state = {
                    updatePosition: false
                },
                position = [100, 200],
                payload = {
                    coordinate: position
                };

            testAction(setCoordinates, payload, state, {}, [], {}, done);
        });
    });
    describe("checkPosition", function () {
        it("checkPosition sets positionMapProjection", done => {
            const state = {
                    updatePosition: true
                },
                position = [100, 200];

            testAction(checkPosition, position, state, {}, [
                {type: "setPositionMapProjection", payload: position}
            ], {}, done);
        });
        it("checkPosition not sets positionMapProjection", done => {
            const state = {
                    updatePosition: false
                },
                position = [100, 200];

            testAction(checkPosition, position, state, {}, [], {}, done);
        });
    });
    */
});
