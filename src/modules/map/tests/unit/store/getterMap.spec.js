import {expect} from "chai";
import sinon from "sinon";
import getters from "../../../store/gettersMap";
import stateMap from "../../../store/stateMap";
import Feature from "ol/Feature";
import LayerGroup from "ol/layer/Group";

describe("src/modules/map/store/gettersMap.js", () => {

    describe("Map simple getters", () => {
        it("returns the map from state", () => {
            const mapStub = sinon.stub(),
                state = {
                    map: mapStub
                };

            expect(getters.map(stateMap)).to.equals(null);
            expect(getters.map(state)).to.equals(mapStub);
        });
        it("returns the layerList from state", () => {
            const mapStub = sinon.stub(),
                state = {
                    layerList: mapStub
                };

            expect(getters.layerList(stateMap)).to.equals(null);
            expect(getters.layerList(state)).to.equals(mapStub);
        });
    });

    describe("Map custom getters", () => {
        it("returns the visibleLayerList", () => {
            const feature1 = new Feature({visible: true}),
                feature2 = new Feature({visible: true}),
                feature3 = new Feature({visible: false}),
                state = {
                    layerList: [feature1, feature2, feature3]
                };

            expect(getters.layerList(state)).to.be.an("array").that.contains(feature1, feature2);
        });
        it("returns the visibleLayerListWithChildrenFromGroupLayers without Group layers", () => {
            const feature1 = new Feature({visible: true}),
                feature2 = new Feature({visible: true}),
                feature3 = new Feature({visible: false}),
                state = {
                    layerList: [feature1, feature2, feature3]
                },
                visibleLayerList = [feature1, feature2];

            expect(getters.visibleLayerListWithChildrenFromGroupLayers(state, {visibleLayerList})).to.be.an("array").that.contains(feature1, feature2);
        });
        it("returns the visibleLayerListWithChildrenFromGroupLayers with Group layers", () => {
            const feature1 = new Feature({visible: true}),
                feature2 = new Feature({visible: true}),
                feature3 = new Feature({visible: true}),
                grouplayer = new LayerGroup({
                    layers: [feature1, feature2]
                }),
                state = {
                    layerList: [grouplayer, feature3]
                },
                visibleLayerList = [grouplayer, feature3];

            expect(getters.visibleLayerListWithChildrenFromGroupLayers(state, {visibleLayerList})).to.be.an("array").that.contains(feature1, feature2, feature3);
        });
        it("returns the visibleWmsLayerList", () => {
            const feature1 = new Feature({visible: true, typ: "WMS"}),
                feature2 = new Feature({visible: true, typ: "WFS"}),
                feature3 = new Feature({visible: true, typ: "WMS"}),
                grouplayer = new LayerGroup({
                    layers: [feature1, feature2]
                }),
                state = {
                    layerList: [grouplayer, feature3]
                },
                visibleLayerListWithChildrenFromGroupLayers = [feature1, feature2, feature3];

            expect(getters.visibleWmsLayerList(state, {visibleLayerListWithChildrenFromGroupLayers})).to.be.an("array").that.contains(feature1, feature3);
        });
    });

});
