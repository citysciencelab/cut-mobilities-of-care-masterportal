<script>
import {mapGetters} from "vuex";
import getters from "../store/gettersMeasure";
import {Fill, Stroke, Style, Text} from "ol/style.js";
import {Polygon, LineString, Point} from "ol/geom.js";
import Feature from "ol/Feature.js";
import uniqueId from "../../../../utils/uniqueId.js";

/**
 * Tooltip shown in the map to indicate measurement results and deviance.
 */
export default {
    name: "MeasureTooltip",
    data: () => {
        return {
            textPoint: null
        };
    },
    computed: {
        ...mapGetters("Tools/Measure", Object.keys(getters))
    },
    watch: {
        featureId () {
            this.textPoint = this.generateTextPoint();
            this.layer.getSource().addFeature(this.textPoint);
        },
        polygonAreas (value) {
            this.setValueAtTooltipLayer(value, "Polygon");
        },
        lineLengths (value) {
            this.setValueAtTooltipLayer(value, "LineString");
        }
    },
    methods: {
        /**
         * Sets the measured value at the tooltip-layer.
         * @param {object} measureValues containes the measure values by featureId
         * @param {string} selectedGeometryName "Polygon" or "LineString"
         * @returns {void}
         */
        setValueAtTooltipLayer (measureValues, selectedGeometryName) {
            if (this.selectedGeometry === selectedGeometryName &&
                this.textPoint &&
                Object.values(measureValues).length > 0 &&
                Object.values(measureValues).findIndex((value) => value === "0") === -1) {
                const geom = this.textPoint.getGeometry(),
                    feature = this.lines[this.featureId] || this.polygons[this.featureId],
                    styles = this.generateTextStyles(feature, measureValues[feature.ol_uid]);


                geom.setCoordinates(this.tooltipCoord);
                this.textPoint.setStyle(styles);
            }
        },
        /**
         * generates text for points
         * @param {number} distance - distance for 3D
         * @param {number} heightDiff - height for 3D
         * @param {number} coords - coordinates for 3D
         * @returns {this} pointFeature
         */
        generateTextPoint (distance, heightDiff, coords) {
            const feature = this.lines[this.featureId] || this.polygons[this.featureId];
            let geom = null,
                coord = null,
                pointFeature = null;

            if (feature !== undefined) {
                geom = feature.getGeometry();
            }

            if (distance !== undefined) {
                coord = coords;
            }
            else if (geom instanceof Polygon) {
                coord = geom.getCoordinates()[0][geom.getCoordinates()[0].length - 2];
            }
            else if (geom instanceof LineString) {
                coord = geom.getLastCoordinate();
            }
            pointFeature = new Feature({
                geometry: new Point(coord)
            });
            if (distance !== undefined) {
                pointFeature.setStyle(this.generate3dTextStyles(distance, heightDiff));
            }
            else {
                pointFeature.setStyle(this.generateTextStyles(feature));
            }
            pointFeature.set("styleId", uniqueId("measureStyle"));
            return pointFeature;
        },
        /**
         * generates style for text in 2D view
         * @param {object} feature - geometry feature
         * @param {string} newValue - new measured value
         * @returns {object} styles
         */
        generateTextStyles (feature, newValue = "0") {
            const fill = new Fill({
                    color: [0, 0, 0, 1]
                }),
                stroke = new Stroke({
                    color: [255, 127, 0, 1],
                    width: 1
                }),
                backgroundFill = new Fill({
                    color: [255, 127, 0, 1]
                });

            return [
                new Style({
                    text: new Text({
                        text: newValue,
                        textAlign: "left",
                        font: "14px sans-serif",
                        fill: fill,
                        stroke: stroke,
                        offsetY: -10,
                        offsetX: 10,
                        backgroundFill: backgroundFill,
                        padding: [5, 0, 5, 0]
                    })
                }),
                new Style({
                    text: new Text({
                        text: feature.get("isBeingDrawn") ? this.$t("modules.tools.measure.finishWithDoubleClick") : null,
                        textAlign: "left",
                        font: "12px sans-serif",
                        fill: fill,
                        stroke: stroke,
                        offsetY: 10,
                        offsetX: 10,
                        backgroundFill: backgroundFill,
                        padding: [5, 0, 5, 0]
                    })
                })
            ];
        }
    }
};
</script>

<template lang="html">
    <div />
</template>
