import Vue from "vue";
import {Draw} from "ol/interaction.js";
import Overlay from "ol/Overlay";

import MeasureTooltip from "../components/MeasureTooltip.vue";
import style from "./measureStyle";
import source from "./measureSource";

import vueI18Next from "../../../../../js/vueI18Next";

let store; // hack - would normally be an import from app-store, but that doesn't work in mochapack

/**
 * Creates measurement tooltip.
 * @param {module:ol/Map} map ol map
 * @param {String} featureId feature id
 * @returns {MeasureOverlay} holding vue instance and overlay
 */
function createTooltip (map, featureId) {
    const element = document.createElement("div"),
        overlay = new Overlay({
            element,
            offset: [20, 0],
            positioning: "center-left",
            stopEvent: false,
            insertFirst: false
        }),
        vueInstance = new Vue({
            el: element,
            name: "MeasureTooltip",
            render: h => h(MeasureTooltip, {
                props: {
                    featureId
                }
            }),
            store,
            i18n: vueI18Next.instance
        });

    map.addOverlay(overlay);

    return {vueInstance, overlay};
}

/**
 * @param {module:ol/Map} map ol/Map
 * @param {module:ol/geom/GeometryType} type geometry type to create when drawing
 * @param {function} addFeature callback for features to put into store
 * @param {function} addOverlay callback to add overlay to store
 * @param {function} setIsDrawing sets whether tool is currently drawing (i.e. sketch exists)
 * @param {object} _store vuex store
 * @returns {module:ol/interaction/Draw} draw interaction
 */
function makeDraw (map, type, addFeature, addOverlay, setIsDrawing, _store) {
    store = _store;

    const draw = new Draw({
        source,
        type,
        style
    });

    let sketch = null,
        listener = null;

    draw.on("drawstart", function (evt) {
        sketch = evt.feature;
        sketch.set("styleId", sketch.ol_uid);
        sketch.set("isBeingDrawn", true);
        addFeature(sketch);

        const {vueInstance, overlay} = createTooltip(map, sketch.ol_uid, store);

        addOverlay({vueInstance, overlay});
        listener = sketch.getGeometry().getType() === "Polygon"
            ? ({target}) => {
                const polygonCoordinates = target.getCoordinates()[0];

                // triggers update, no duplicates are created by add method design
                addFeature(sketch);
                overlay.setPosition(polygonCoordinates[polygonCoordinates.length - 2]);
            }
            : ({target}) => {
                addFeature(sketch);
                overlay.setPosition(target.getLastCoordinate());
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
