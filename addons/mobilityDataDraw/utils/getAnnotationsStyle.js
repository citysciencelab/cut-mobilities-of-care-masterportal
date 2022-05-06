import Point from "ol/geom/Point";
import {RegularShape, Fill, Stroke, Style, Icon, Circle} from "ol/style";

import {annotationColor, mobilityModeColors} from "../store/constantsMobilityDataDraw";

import getFillPattern from "./getFillPattern";
import {getHandleStyle, getDragStyle} from "./getModifyStyle";

/**
 * Creates and returns the feature styles for annotations.
 *
 * @param {module:ol/Feature} feature to render
 * @returns {Array<module:ol/style/Style>} the styles to render the feature
 */
export default function getAnnotationsStyle(feature) {
    const geometry = feature.getGeometry(),
        featureMobilityMode = feature.get("mobilityMode"),
        isSelected = feature.get("isSelected"),
        isModifying = feature.get("isModifying"),
        styles = [];

    // Add drag arrows to point when in modifying mode
    if (isModifying && geometry.getType() === "Point") {
        const coordinate = geometry.getCoordinates();

        styles.push(getDragStyle(coordinate));
    }

    // Style for annotation points
    styles.push(
        new Style({
            image: new RegularShape({
                points: 4,
                radius: isSelected ? 12 : 8,
                fill: new Fill({
                    color: annotationColor.fill
                }),
                stroke: new Stroke({
                    color: "#fff",
                    width: 2
                })
            }),
            zIndex: isSelected ? Infinity : 1000
        })
    );

    // Style for annotation lines and areas
    styles.push(
        new Style({
            // Area annotations fill
            fill: new Fill({
                color: getFillPattern(
                    annotationColor.fill,
                    "rgba(255,255,255,0.4)"
                )
            }),
            // Line and area annotations stroke
            stroke: new Stroke({
                color: annotationColor.fill,
                width: isSelected ? 3 : 2
            }),
            ...isSelected && {zIndex: Infinity}
        })
    );

    // Add arrows to the end of each line segment
    // pointing in the direction of movement
    if (geometry.getType() === "LineString") {
        const featureColor = mobilityModeColors[featureMobilityMode].hex,
            strokeColor = mobilityModeColors[featureMobilityMode].strokeHex;

        // Add an outline to selected lines
        if (isSelected) {
            styles.push(
                new Style({
                    stroke: new Stroke({
                        color: strokeColor,
                        width: 6
                    }),
                    zIndex: Infinity
                })
            );
        }

        // Color the line according to the mobility mode
        // which was selected for this feature
        styles.push(
            new Style({
                stroke: new Stroke({
                    color: featureColor,
                    width: isSelected ? 3 : 2
                }),
                ...isSelected && {zIndex: Infinity}
            })
        );
        let isFirstSegment = true;

        geometry.forEachSegment((start, end) => {
            const segmentWidth = end[0] - start[0],
                segmentHeight = end[1] - start[1],
                rotation = Math.atan2(segmentHeight, segmentWidth);

            styles.push(
                new Style({
                    geometry: new Point(end),
                    image: new Icon({
                        color: featureColor,
                        scale: isSelected ? 1 : 0.57,
                        src: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='42px' height='42px' fill='%23fff'%3E%3Cpath d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z'${
                            isSelected
                                ? ` stroke='${encodeURIComponent(
                                    strokeColor
                                )}' stroke-width='1'`
                                : ""
                        }/%3E%3C/svg%3E`,
                        anchor: [0.6, 0.5],
                        rotateWithView: true,
                        rotation: -rotation
                    }),
                    ...isSelected && {zIndex: Infinity}
                })
            );

            // Add handles to line edges when in modifying mode
            if (isModifying) {
                if (isFirstSegment) {
                    styles.push(
                        getHandleStyle(start, featureColor, strokeColor)
                    );
                }
                styles.push(getHandleStyle(end, featureColor, strokeColor));
            }

            isFirstSegment = false;
        });
    }

    return styles;
}
