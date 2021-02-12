import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    LinearRing,
    Point,
    Polygon
} from "ol/geom";

/**
 * Injects OpenLayers geom classes to JSTS Parser
 *
 * @param {Object} context - context object for actions
 *
 * @returns {void}
 */
function initJSTSParser ({getters}) {
    // inject possible geometries to jsts parser
    getters.jstsParser.inject(
        Point,
        LineString,
        LinearRing,
        Polygon,
        MultiPoint,
        MultiLineString,
        MultiPolygon
    );
}
/**
 * Initially loads all available options for select elements
 *
 * @param {Object} context - context object for actions
 *
 * @return {void}
 */
function loadSelectOptions ({commit}) {
    const layers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"}) || [];

    layers.forEach(layer => {
        // @Todo: add performance warning
        if (layer.get("layerSource").getFeatures().length > 100) {
            layer.set("performanceWarning", true);
        }
        commit("addSelectOption", layer);
    });
}

export {
    initJSTSParser,
    loadSelectOptions
};
