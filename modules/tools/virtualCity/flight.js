import {getInstance as getFlightPlayerInstance} from "./flightPlayer";

/**
 * @typedef {Object} FlightInstance.Anchor
 * @property {ol.Coordinate} cameraPosition - ol3 coordinate array with xyz coordinates (z value is mandatory)
 * @property {number} [heading=0] - angle between 0 and 360 degree
 * @property {number} [pitch=-90] - angle between 0 and 360 degree
 * @property {number} [roll=0] - angle between 0 and 360 degree
 * @property {number} duration - the duration in seconds
 */

const FlightInstance = Backbone.Model.extend(/** @lends FlightInstance.prototype */ {
    /**
     * @class FlightInstance
     * @extends Backbone.Model
     * @description FlightInstance of the virtualcitysystems PlanningService, a container for viewpoints and settings
     * @memberof Tools.VirtualCity
     * @constructs
     * @property {string} name - name of the flightInstance
     * @property {Array<FlightInstance.Anchor>} viewpoints - list of viewpoints Anchors defining the flight
     * @property {Boolean} loop - if the flight should be looped
     * @property {String} interpolation - interpolation method
     */
    defaults: Object.assign({}, Backbone.Model.defaults, {
        name: "",
        viewpoints: [],
        loop: false,
        interpolation: "spline"
    }),

    /**
     * checks if this flightInstance is valid
     * @return {boolean} -
     */
    isValid () {
        this.get("viewpoints").forEach((vp, index) => {
            if (!vp.cameraPosition) {
                this.get("viewpoints").splice(index, 1);
            }
        });
        return this.get("viewpoints").length >= 2;
    }
});

export default FlightInstance;

/**
 * parses source and creates a flightInstance
 * @param {Object} source -
 * @return {FlightInstance} flightInstance -
 * @memberof Tools.VirtualCity
 */
export function parseFlightOptions (source) {
    const features = source.features;

    if (Array.isArray(features)) {
        const viewpoints = features.map(item => item.properties),
            loop = source.vcsMeta.flightOptions.loop,
            interpolation = source.vcsMeta.flightOptions.interpolation,
            name = source.vcsMeta.flightOptions.name;

        getFlightPlayerInstance();

        return new FlightInstance({name, viewpoints, loop, interpolation});
    }
    return null;
}
