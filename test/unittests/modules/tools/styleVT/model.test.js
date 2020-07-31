import StyleVTModel from "@modules/tools/styleVT/model.js";
import {expect} from "chai";
import sinon from "sinon";

/**
 * Context mock function.
 * @param {String} activeLayer id of active layer
 * @returns {object} context object
 */
function createContext (activeLayer) {
    return {
        get: key => ({
            model: activeLayer
                ? {get: innerKey => ({id: activeLayer})[innerKey]}
                : null
        })[key],
        set: sinon.spy(),
        setModel: sinon.spy()
    };
}

describe("tools/styleVT/model", function () {
    beforeEach(function () {
        sinon.stub(Radio, "request").callsFake(() => [
            {get: key => ({name: "Layer One", id: "l1"})[key]},
            {get: key => ({name: "Layer Two", id: "l2"})[key]}
        ]);
    });

    afterEach(sinon.restore);

    it("refreshVectorTileLayerList updates local representation", function () {
        const context = createContext(),
            {set, setModel} = context;

        StyleVTModel.prototype.refreshVectorTileLayerList.call(context);

        expect(set.calledOnce).to.be.true;
        expect(set.calledWithMatch("vectorTileLayerList", [
            {name: "Layer One", id: "l1"},
            {name: "Layer Two", id: "l2"}
        ]));
        expect(setModel.notCalled).to.be.true;
    });

    it("refreshVectorTileLayerList does not touch a still visible layer choice", function () {
        const context = createContext("l2"),
            {setModel} = context;

        StyleVTModel.prototype.refreshVectorTileLayerList.call(context);

        expect(setModel.notCalled).to.be.true;
    });

    it("refreshVectorTileLayerList removes invisible layers from current choice", function () {
        const context = createContext("l3"),
            {setModel} = context;

        StyleVTModel.prototype.refreshVectorTileLayerList.call(context);

        expect(setModel.calledOnce).to.be.true;
        expect(setModel.calledWith(null)).to.be.true;
    });
});
