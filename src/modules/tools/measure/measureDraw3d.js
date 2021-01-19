import {Fill, Stroke, Style, Text} from "ol/style.js";
import {LineString, Point} from "ol/geom.js";
import Feature from "ol/Feature";
import * as Proj from "ol/proj.js";

import source from "./measureSource";

let firstPoint = null,
    firstPointFeature = null,
    idCounter = 0;

const fill = new Fill({
        color: [255, 255, 255, 1]
    }),
    stroke = new Stroke({
        color: [0, 0, 0, 1],
        width: 2
    });

/**
 * Update function to translate feature measurement. (Must be re-added to olcs.)
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
 * @param {string} selectedUnit whether to measure in m or km
 * @param {function} addUnlistener function to register unlisteners
 * @returns {object} styles
 */
function generate3dTextStyles (distance, heightDiff, selectedUnit, addUnlistener) {
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

    /**
     * Updates text nodes on language change.
     * @returns {void}
     */
    function updateText () {
        lengthText.setText(i18next.t("modules.tools.measure.3dLength", {
            length: selectedUnit === "1"
                ? `${(distance / 1000).toFixed(3)}km`
                : `${distance.toFixed(2)}m`
        }));

        heightText.setText(i18next.t("modules.tools.measure.3dHeight", {
            height: `${heightDiff.toFixed(2)}m`
        }));
    }
    updateText();

    i18next.on("languageChanged", updateText);
    addUnlistener(() => i18next.off("languageChanged", updateText));

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
 * @param {string} selectedUnit whether to measure in m or km
 * @param {function} addUnlistener function to register unlisteners
 * @returns {module:ol/Feature} pointFeature
 */
function generateTextPoint (distance, heightDiff, coords, selectedUnit, addUnlistener) {
    const pointFeature = new Feature({
        geometry: new Point(coords)
    });

    pointFeature.setStyle(generate3dTextStyles(distance, heightDiff, selectedUnit, addUnlistener));
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
 * @todo Write the documentation.
 * @param {module:ol/Map} map ol 3d map
 * @param {string} projectionCode current map projection code
 * @param {string} selectedUnit whether to measure in m or km
 * @param {function} addUnlistener function to register unlisteners
 * @param {object} obj point with coordinates
 * @returns {this} this
 */
function handle3DClicked (map, projectionCode, selectedUnit, addUnlistener, obj) {
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
            textPoint = generateTextPoint(distance, heightDiff, coords, selectedUnit, addUnlistener),
            boundUpdateTextPoint = updateTextPoint.bind(null, textPoint);

        source.removeFeature(firstPointFeature);
        source.addFeature(feature);
        source.addFeature(textPoint);

        i18next.on("languageChanged", boundUpdateTextPoint);
        addUnlistener(() => i18next.off("languageChanged", boundUpdateTextPoint));

        firstPoint = null;
        firstPointFeature = null;
    }
}

/**
 * @param {module:ol/Map} map ol/Map
 * @param {string} projectionCode current map projection
 * @param {string} selectedUnit whether to measure in m or km
 * @param {function} addUnlistener function to register unlisteners
 * @returns {MeasureDraw3d} measurement-interaction representing object (no real module:ol/interaction)
 */
function makeDraw (map, projectionCode, selectedUnit, addUnlistener) {
    // TODO when the 3d module is moved from backbone, this function must be migrated to listen to the new click mechanism
    const mapChannel = Radio.channel("Map"),
        handle = handle3DClicked.bind(null, map, projectionCode, selectedUnit, addUnlistener);

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
