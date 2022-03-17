import Point from "ol/geom/Point";
import {Circle, Fill, Icon, Stroke, Style} from "ol/style";

/**
 * Returns the style added to line or area edges when in modifying mode
 *
 * @param {module:ol/coordinate-Coordinate} coordinate the coordinate to place the handle
 * @param {string} fillColor the color to fill the handle
 * @param {string} strokeColor the color for the handle stroke
 * @returns {module:ol/style/Style} the style to render the feature in modifying mode
 */
export function getHandleStyle (coordinate, fillColor, strokeColor) {
    return new Style({
        geometry: new Point(coordinate),
        image: new Circle({
            radius: 8,
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                color: strokeColor,
                width: 2
            })
        }),
        zIndex: Infinity
    });
}

/**
 * Returns the style added to points when in modifying mode
 *
 * @param {module:ol/coordinate-Coordinate} coordinate the coordinate to place the icon
 * @returns {module:ol/style/Style} the style to render the feature in modifying mode
 */
export function getDragStyle (coordinate) {
    return new Style({
        geometry: new Point(coordinate),
        image: new Icon({
            scale: 1,
            src:
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='50px' height='50px' fill='%2366afe9'%3E%3Cpath d='m 20,8.0000005 v 3.0666665 l -3.84,-0.01333 V 12.94667 L 20,12.93334 v 3.066667 L 24,12 Z M 8,4.0000004 h 3.066667 l -0.01333,3.8400001 h 1.893334 L 12.933333,4.0000004 H 16 L 12,4.2e-7 Z M 4,16.000001 v -3.066667 l 3.84,0.01333 V 11.053331 L 4,11.066667 V 8.0000005 L -6.0000001e-8,12 Z m 12,4 h -3.066667 l 0.01333,-3.84 h -1.893334 l 0.01333,3.84 H 8 l 4,4 z'/%3E%3C/svg%3E%0A",
            anchor: [0.5, 0.5]
        }),
        zIndex: Infinity
    });
}
