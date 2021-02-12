import Layer from "../../../../../../../../modules/core/modelList/layer/model";
import sinon from "sinon";

/**
 * Creates an array with a given number of Layer Objects
 *
 * @param {number} count the number of returned array element
 *
 * @return {Array} the array of layer objects
 */
function createLayersArray (count) {
    const layers = [];

    for (let i = 0; i < count; i++) {
        const layer = new Layer(); // javascript object

        layer.setIsSelectedSpy = sinon.spy();
        layer.set("name", "Layer" + i);
        layer.set("id", i);
        sinon.stub(layer, "setIsSelected").callsFake(layer.setIsSelectedSpy);
        layers.push(layer);
    }
    return layers;
}

/**
 * Resolves pending promises
 *
 * @return {Promise<unknown>} resolved promise
 */
function tick () {
    return new Promise(resolve => {
        setTimeout(resolve, 0);
    });
}

export {
    createLayersArray,
    tick
};
