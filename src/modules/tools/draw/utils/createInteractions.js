import {Select, Modify, Draw} from "ol/interaction.js";
import {createStyle} from "./style/createStyle";

/**
 * Creates a draw interaction to draw features on the map.
 *
 * @param {Object} state actions context object.
 * @returns {ol/interaction/Draw} draw interaction
 */
function createDrawInteraction (state) {
    return new Draw({
        source: state.layer.getSource(),
        type: state.drawType.geometry,
        style: createStyle(state),
        freehand: state.freeHand
    });
}

/**
 * Creates a modify interaction and returns it.
 *
 * @param  {module:ol/layer/Vector} layer The layer in which the features are drawn.
 * @returns {module:ol/interaction/Modify} The modify interaction.
 */
function createModifyInteraction (layer) {
    return new Modify({
        source: layer.getSource()
    });
}

/**
 * Creates a select interaction (for deleting features) and returns it.
 *
 * @param  {module:ol/layer/Vector} layer The layer in which the features are drawn.
 * @returns {module:ol/interaction/Select} The select interaction.
 */
function createSelectInteraction (layer) {
    return new Select({
        layers: [layer]
    });
}

export {
    createDrawInteraction,
    createModifyInteraction,
    createSelectInteraction
};
