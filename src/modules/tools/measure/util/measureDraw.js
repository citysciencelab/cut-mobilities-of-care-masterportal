import {Draw} from "ol/interaction.js";
import style from "./measureStyle";
import source from "./measureSource";

/**
 * @param {module:ol/geom/GeometryType} type geometry type to create when drawing
 * @param {function} addFeature callback for features to put into store
 * @param {function} setIsDrawing sets whether tool is currently drawing (i.e. sketch exists)
 * @param {function} setFeatureId to set the feature id into state
 * @param {function} setTooltipCoord to set the coordinates for the tooltip into state
 * @returns {module:ol/interaction/Draw} draw interaction
 */
function makeDraw (type, addFeature, setIsDrawing, setFeatureId, setTooltipCoord) {
    const draw = new Draw({
        source,
        type,
        style
    });

    let sketch = null,
        listener = null;

    draw.on("drawstart", function (evt) {
        sketch = evt.feature;
        sketch.set("isBeingDrawn", true);
        addFeature(sketch);
        setFeatureId(sketch.ol_uid);

        listener = sketch.getGeometry().getType() === "Polygon"
            ? ({target}) => {
                const polygonCoordinates = target.getCoordinates()[0];

                // triggers update, no duplicates are created by add method design
                addFeature(sketch);
                setTooltipCoord(polygonCoordinates[polygonCoordinates.length - 2]);
            }
            : ({target}) => {
                addFeature(sketch);
                setTooltipCoord(target.getLastCoordinate());
            };

        sketch.getGeometry().on("change", listener);
        setIsDrawing(true);
    });

    draw.on("drawend", function () {
        sketch.getGeometry().un("change", listener);
        sketch.set("isBeingDrawn", false);
        sketch = null;
        listener = null;
        setIsDrawing(false);
    });

    return draw;
}

export default makeDraw;
