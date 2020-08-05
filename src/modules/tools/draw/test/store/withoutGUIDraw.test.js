import sinon from "sinon";
import {expect} from "chai";
import actions from "../../store/actionsDraw";

describe("withoutGUIDraw", () => {
    let commit, dispatch, state;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("cancelDrawWithoutGUI", () => {
        it("should dispatch as intended", () => {
            actions.cancelDrawWithoutGUI({dispatch});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["resetModule"]);
        });
    });
    describe("downloadFeaturesWithoutGUI", () => {
        const coordinates = [[
                [559656.9477852482, 5930649.742761639],
                [559514.0728624006, 5932126.116964397],
                [561180.9469622886, 5931935.617067266],
                [560831.6971508835, 5930824.367667342],
                [559656.9477852482, 5930649.742761639]
            ]],
            featureCollectionFromJson = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[559656.9477852482, 5930649.742761639], [559514.0728624006, 5932126.116964397], [561180.9469622886, 5931935.617067266], [560831.6971508835, 5930824.367667342], [559656.9477852482, 5930649.742761639]]]}, "properties": null}]},
            geometryName = Symbol(),
            itemSymbol = Symbol(),
            multiPolygonfeatColFromJson = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "MultiPolygon", "coordinates": [[[[559656.9477852482, 5930649.742761639], [559514.0728624006, 5932126.116964397], [561180.9469622886, 5931935.617067266], [560831.6971508835, 5930824.367667342], [559656.9477852482, 5930649.742761639]]]]}, "properties": null}]},
            properties = Symbol();
        let downloadedFeatures,
            item,
            rootState,
            type;

        beforeEach(() => {
            item = {
                getGeometry: () => ({
                    getCoordinates: () => type.match(/^Multi/) ? [coordinates] : coordinates,
                    getType: () => type
                }),
                getGeometryName: () => geometryName,
                getId: () => itemSymbol,
                getProperties: () => properties
            };
            rootState = {
                Map: {
                    map: {
                        getView: () => ({
                            getProjection: () => ({getCode: () => "EPSG:4326"})
                        })
                    }
                }
            };
            state = {
                layer: {
                    getSource: () => ({getFeatures: () => [item]})
                }
            };
        });

        it("should return a FeatureCollection for normal geometries", function () {
            type = "Polygon";
            downloadedFeatures = actions.downloadFeaturesWithoutGUI({state, rootState});

            expect(downloadedFeatures).to.eql(JSON.stringify(featureCollectionFromJson));
        });

        it("should return a multiPolygon in the FeatureCollection for multigeometries", function () {
            type = "MultiPolygon";
            downloadedFeatures = actions.downloadFeaturesWithoutGUI({state, rootState}, {"geomType": "multiGeometry"});

            expect(downloadedFeatures).to.eql(JSON.stringify(multiPolygonfeatColFromJson));
        });
    });
    describe("downloadViaRemoteInterface", () => {
        const geomType = Symbol(),
            result = Symbol();

        it("should dispatch as aspected", () => {
            dispatch = sinon.stub().resolves(result);

            actions.downloadViaRemoteInterface({dispatch}, geomType);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["downloadFeaturesWithoutGUI", geomType]);
        });
    });
    describe("editFeaturesWithoutGUI", () => {
        it("should dispatch as aspected", () => {
            actions.editFeaturesWithoutGUI({dispatch});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["manipulateInteraction", {interaction: "draw", active: false}]);
            expect(dispatch.secondCall.args).to.eql(["createModifyInteractionAndAddToMap"]);
        });
    });
    describe("initializeWithoutGUI", () => {
        const color = Symbol(),
            maxFeatures = Symbol();
        let drawType = Symbol(),
            request;

        beforeEach(() => {
            request = sinon.spy();
            state = {};
            sinon.stub(Radio, "request").callsFake(request);
        });

        it("should commit and dispatch as intended if the given drawType is not a Point, LineString, Polygon or Circle", () => {
            actions.initializeWithoutGUI({state, commit, dispatch}, {drawType});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setRenderToWindow", false]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["setActive", true]);
        });
        it("should commit and dispatch as intended if the given drawType is a Point, LineString, Polygon or Circle", () => {
            drawType = "Point";

            actions.initializeWithoutGUI({state, commit, dispatch}, {drawType, maxFeatures});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setRenderToWindow", false]);
            expect(commit.secondCall.args).to.eql(["setDrawType", {id: "drawPoint", geometry: "Point"}]);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["setActive", true]);
            expect(dispatch.secondCall.args).to.eql(["createDrawInteractionAndAddToMap", {active: true, maxFeatures}]);
        });
        it("should commit and dispatch as intended if the given drawType is a Point, LineString, Polygon or Circle and the color is defined", () => {
            drawType = "LineString";

            actions.initializeWithoutGUI({state, commit, dispatch}, {drawType, color, maxFeatures});

            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setRenderToWindow", false]);
            expect(commit.secondCall.args).to.eql(["setDrawType", {id: "drawLine", geometry: "LineString"}]);
            expect(commit.thirdCall.args).to.eql(["setColor", color]);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["setActive", true]);
            expect(dispatch.secondCall.args).to.eql(["createDrawInteractionAndAddToMap", {active: true, maxFeatures}]);
        });
        it("should commit and dispatch as intended if the given drawType is a Point, LineString, Polygon or Circle and the opacity is defined", () => {
            const opacity = "3.5",
                resultColor = [0, 1, 2, 3.5];

            drawType = "LineString";
            state.color = resultColor.slice(0, 3);

            actions.initializeWithoutGUI({state, commit, dispatch}, {drawType, opacity, maxFeatures});

            expect(commit.callCount).to.equal(4);
            expect(commit.firstCall.args).to.eql(["setRenderToWindow", false]);
            expect(commit.secondCall.args).to.eql(["setDrawType", {id: "drawLine", geometry: "LineString"}]);
            expect(commit.thirdCall.args).to.eql(["setColor", resultColor]);
            expect(commit.lastCall.args).to.eql(["setOpacity", "3.5"]);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["setActive", true]);
            expect(dispatch.secondCall.args).to.eql(["createDrawInteractionAndAddToMap", {active: true, maxFeatures}]);
        });
    });
});
