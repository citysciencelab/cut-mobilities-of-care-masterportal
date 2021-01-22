import proj4 from "proj4";

import getProjections from "./getProjections";

const projections = getProjections("EPSG:25832", "EPSG:4326", "32");

/**
 * Transforms the given line or polygon coordinates from EPSG:25832 to EPSG:4326.
 *
 * @param {(Array<number>|Array<Array<number>>|Array<Array<Array<number>>>)} coords Coordinates.
 * @param {Boolean} isPolygon Determines whether the given coordinates are a polygon or a line.
 * @returns {(Array<number>|Array<Array<number>>|Array<Array<Array<number>>>)} Transformed coordinates.
 */
function transform (coords, isPolygon) {
    const transCoords = [];

    // NOTE(roehlipa): The polygon parts look like they would not work as intended. Simply copied from the old version.
    for (const value of coords) {
        if (isPolygon) {
            value.forEach(point => {
                transCoords.push(transformPoint(point));
            });
            continue;
        }
        transCoords.push(transformPoint(value));
    }

    return isPolygon ? [transCoords] : transCoords;
}

/**
 * Transforms the given point coordinates from EPSG:25832 to EPSG:4326.
 *
 * @param {number[]} coords Coordinates.
 * @returns {number[]} Transformed coordinates.
 */
function transformPoint (coords) {
    return proj4(projections.sourceProj, projections.destProj, coords);
}

export {
    transform,
    transformPoint
};
