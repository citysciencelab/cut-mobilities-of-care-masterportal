import {Fill, Stroke, Style, Text} from "ol/style.js";
import {LineString, Point} from "ol/geom.js";
import Feature from "ol/Feature";
import * as Proj from "ol/proj.js";

import source from "./measureSource";
import store from "../../../../app-store";

// variables to keep half-done measurements in quick access
let firstPoint = null,
    firstPointFeature = null,
    idCounter = 0;

// display font style
const fill = new Fill({
        color: [255, 255, 255, 1]
    }),
    stroke = new Stroke({
        color: [0, 0, 0, 1],
        width: 2
    });

/**
 * Update function to translate/update feature measurement.
 * (Must be re-added to olcs after ol elements habe been changed..)
 * @param {module:ol/Feature} textPoint text point
 * @returns {void}
 */
function updateTextPoint (textPoint) {
    source.removeFeature(textPoint);
    source.addFeature(textPoint);
}

/**
 * Generates style for text in 3D view.
 * @param {number} distance distance between two points
 * @param {number} heightDiff height difference
 * @param {function} addUnlistener function to register unlisteners
 * @returns {object} styles
 */
function generate3dTextStyles (distance, heightDiff, addUnlistener) {
    const lengthText = new Text({
            text: "",
            textAlign: "left",
            font: "18px sans-serif",
            fill,
            stroke,
            offsetY: -50,
            offsetX: 10
        }),
        heightText = new Text({
            text: "",
            textAlign: "left",
            font: "18px sans-serif",
            fill,
            stroke,
            offsetY: -30,
            offsetX: 10
        });

    let currentUnit = store.getters["Tools/Measure/selectedUnit"];

    /**
     * Updates text nodes on language change.
     * @returns {void}
     */
    function updateText () {
        lengthText.setText(i18next.t("modules.tools.measure.3dLength", {
            length: currentUnit === "1"
                ? `${(distance / 1000).toFixed(1)}km`
                : `${distance.toFixed(0)}m`
        }));

        heightText.setText(i18next.t("modules.tools.measure.3dHeight", {
            height: `${heightDiff.toFixed(0)}m`
        }));
    }
    updateText();

    /*
     * update text elements when the language OR measurement unit is changed;
     * however, olcs does not listen to this, and does not update the display text;
     * the ol text elements are re-added to update with the boundUpdateTextPoint in a next step
     * (see handle3DClicked for that)
     */
    i18next.on("languageChanged", updateText);
    addUnlistener(() => i18next.off("languageChanged", updateText));

    // store.subscribe returns an unlistener function
    addUnlistener(store.subscribe(({type, payload}) => {
        if (type === "Tools/Measure/setSelectedUnit") {
            currentUnit = payload;
            updateText();
        }
    }));

    return [
        new Style({text: lengthText}),
        new Style({text: heightText})
    ];
}

/**
 * Generates measurement result as a text point.
 * @param {number} distance distance for 3D
 * @param {number} heightDiff height for 3D
 * @param {number} coords coordinates for 3D
 * @param {function} addUnlistener function to register unlisteners
 * @returns {module:ol/Feature} pointFeature
 */
function generateTextPoint (distance, heightDiff, coords, addUnlistener) {
    const pointFeature = createPointFeature(coords);

    pointFeature.setStyle(generate3dTextStyles(distance, heightDiff, addUnlistener));
    pointFeature.set("styleId", `__measureStyle_${idCounter++}`);

    return pointFeature;
}

/**
 * Creates a line feature from a start and end coordinate.
 * @param {object} firstCoord first coordinate of the line feature
 * @param {object} lastCoord last coordinate of the line feature
 * @returns {module:ol/Feature} line feature
 */
function createLineFeature (firstCoord, lastCoord) {
    return new Feature({
        geometry: new LineString([
            firstCoord,
            lastCoord
        ])
    });
}

/**
 * Creates a point feature from a coordinate.
 * @param {object} coords coordinates of point in 3D
 * @returns {module:ol/Feature} point feature
 */
function createPointFeature (coords) {
    return new Feature({
        geometry: new Point(coords)
    });
}

/**
 * Handler for 3D clicks.
 * @param {module:ol/Map} map ol 3d map
 * @param {string} projectionCode current map projection code
 * @param {function} addUnlistener function to register unlisteners
 * @param {object} obj point with coordinates
 * @returns {void}
 */
function handle3DClicked (map, projectionCode, addUnlistener, obj) {
    const scene = map.getCesiumScene(),
        object = scene.pick(obj.position);

    let cartesian,
        cartographic,
        ray,
        coords;

    if (object) {
        cartesian = scene.pickPosition(obj.position);
        cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    }
    else {
        ray = scene.camera.getPickRay(obj.position);
        cartesian = scene.globe.pick(ray, scene);
        cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        cartographic.height = scene.globe.getHeight(cartographic);
    }

    coords = [
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
        cartographic.height
    ];
    coords = Proj.transform(coords, Proj.get("EPSG:4326"), projectionCode);

    if (!firstPoint) {
        // no point set => draw point
        firstPointFeature = createPointFeature(coords);
        source.addFeature(firstPointFeature);
        firstPoint = {cartesian, coords};
    }
    else {
        // point already set => create line between points, delete points
        const distance = Cesium.Cartesian3.distance(firstPoint.cartesian, cartesian),
            heightDiff = Math.abs(coords[2] - firstPoint.coords[2]),
            feature = createLineFeature(firstPoint.coords, coords),
            textPoint = generateTextPoint(distance, heightDiff, coords, addUnlistener),
            boundUpdateTextPoint = updateTextPoint.bind(null, textPoint);

        source.removeFeature(firstPointFeature);
        source.addFeature(feature);
        source.addFeature(textPoint);

        // update text points by re-adding - olcs won't notice else
        i18next.on("languageChanged", boundUpdateTextPoint);
        addUnlistener(() => i18next.off("languageChanged", boundUpdateTextPoint));
        addUnlistener(store.subscribe(({type}) => {
            if (type === "Tools/Measure/setSelectedUnit") {
                boundUpdateTextPoint();
            }
        }));

        firstPoint = null;
        firstPointFeature = null;
    }
}

/**
 * @param {module:ol/Map} map ol/Map
 * @param {string} projectionCode current map projection
 * @param {function} addUnlistener function to register unlisteners
 * @returns {MeasureDraw3d} measurement-interaction representing object (no real module:ol/interaction)
 */
function makeDraw (map, projectionCode, addUnlistener) {
    /* TODO
     * when the 3d module is moved from backbone, this function must be updated
     * to listen to the new click mechanism; 3d measure may also be fully integrated
     * into vuex then
     */
    const mapChannel = Radio.channel("Map"),
        handle = handle3DClicked.bind(null, map, projectionCode, addUnlistener);

    mapChannel.on("clickedWindowPosition", handle);

    return {
        abortDrawing: () => {
            if (firstPointFeature) {
                source.removeFeature(firstPointFeature);
                firstPoint = null;
                firstPointFeature = null;
            }
        },
        stopInteraction: () => {
            mapChannel.off("clickedWindowPosition", handle);
        },
        interaction3d: true
    };
}

export default makeDraw;
