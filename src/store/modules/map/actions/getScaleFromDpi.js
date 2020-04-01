import {getDistance} from "ol/sphere";
import {transform} from "ol/proj";

/**
 * Return current scale depending on map zoom and device dpi.
 * @param {module:ol/Map} map openlayer map object
 * @param {number} dpi device dpi
 * @returns {?number} scale as the x in '1 : x'
 */
function getScaleFromDpi (map, dpi) {
    const view = map.getView(),
        projection = view.getProjection(),
        // first compare value
        comparator1 = view.getCenter(),
        pixelPosition = map.getPixelFromCoordinate(comparator1);

    if (pixelPosition) {
        // get second compare value by measuring distance to neighbouring pixel coordinate
        const comparator2 = map.getCoordinateFromPixel([pixelPosition[0], pixelPosition[1] + 1]);

        // get distance, transform to dpi
        let d = getDistance(
            transform(comparator1, projection, "EPSG:4326"),
            transform(comparator2, projection, "EPSG:4326"),
            6378137
        );

        d *= dpi / 0.0254; // 1 dot/m = 0.0254 dpi

        return d;
    }

    return null;
}

export default getScaleFromDpi;
