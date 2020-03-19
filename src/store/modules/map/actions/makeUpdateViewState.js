import {getDistance} from "ol/sphere";
import {transform} from "ol/proj";

/**
 * Return current scale depending on map zoom and device dpi.
 * @param {module:ol/Map} map openlayer map object
 * @returns {?number} scale as the x in '1 : x'
 */
function getScaleFromDpi (map) {
    const dpi = 96, // TODO - get dpi from rootState here
        view = map.getView(),
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

/**
 * TODO try to model this directly as an action
 * @param {function} commit commit function
 * @param {module:ol/Map} map openlayer map object
 * @returns {function} update function for state parts to update onmoveend
 */
function makeUpdateViewState (commit, map) {
    return () => {
        const mapView = map.getView();

        commit("setZoomLevel", mapView.getZoom());
        commit("setMaxZoomLevel", mapView.getMaxZoom());
        commit("setMinZoomLevel", mapView.getMinZoom());
        commit("setResolution", mapView.getResolution());
        commit("setMaxResolution", mapView.getMaxResolution());
        commit("setMinResolution", mapView.getMinResolution());
        commit("setScale", getScaleFromDpi(map));
        commit("setBbox", mapView.calculateExtent(map.getSize()));
        commit("setRotation", mapView.getRotation());
        commit("setCenter", mapView.getCenter());
    };
}

export default makeUpdateViewState;
