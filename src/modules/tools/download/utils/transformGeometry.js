import proj4 from "proj4";

import getProjections from "./getProjections";

const projections = getProjections("EPSG:25832", "EPSG:4326", "32");

function transformLine (coords) {
    const transCoords = [];

    coords.forEach(point => {
        transCoords.push(transformPoint(point));
    });

    return transCoords;
}

function transformPoint (coords) {
    return proj4(projections.sourceProj, projections.destProj, coords);
}

function transformPolygon (coords) {
    const transCoords = [];

    // TODO: This doesn't seem like it would work as intended.
    coords.forEach(points => {
        points.forEach(point => {
            transCoords.push(transformPoint(point));
        });
    });
    return [transCoords];
}

export {
    transformLine,
    transformPoint,
    transformPolygon
};
