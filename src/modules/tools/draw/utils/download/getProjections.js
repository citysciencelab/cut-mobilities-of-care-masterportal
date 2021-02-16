import proj4 from "proj4";

/**
 * Gets the projections in proj4 format.
 *
 * @param {String} sourceProj Source projection name.
 * @param {String} destProj Destination projection name.
 * @param {String} zone Zone of source projection.
 * @returns {Object} An object with the definitions of the given projection names.
 */
export default function getProjections (sourceProj, destProj, zone) {
    proj4.defs(sourceProj, "+proj=utm +zone=" + zone + "ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs");

    return {
        sourceProj: proj4(sourceProj),
        destProj: proj4(destProj)
    };
}
