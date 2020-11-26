import axios from "axios";
import Planning from "./planning";
import Tool from "../../core/modelList/tool/model";
import getProxyUrl from "../../../src/utils/getProxyUrl";

const VirtualCity = Tool.extend(/** @lends VirtualCity.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        planningCache: {},
        readyPromise: null,
        useProxy: false
    }),

    /**
     * @class VirtualCity
     * @extends Tool
     * @memberof Tools.VirtualCity
     * @constructs
     * @property {String} serviceID=undefined Id of service in rest-services.json thats contains the service url
     * @property {Boolean} useProxy=false Attribute to request the URL via a reverse proxy.
     * @listens VirtualCity#RadioRequestVirtualCityGetPlanningById
     * @listens VirtualCity#RadioRequestVirtualCityGetPlannings
     * @listens VirtualCity#RadioRequestVirtualCityActivatePlanning
     * @listens VirtualCity#RadioRequestVirtualCityDeactivatePlanning
     * @listens VirtualCity#RadioRequestVirtualCityGetViewpointsForPlanning
     * @listens VirtualCity#RadioRequestVirtualCityGetFlightsForPlanning
     * @listens VirtualCity#RadioRequestVirtualCityGotoViewPoint
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     */
    initialize () {
        this.superInitialize();
        this.addRadio();
    },

    /**
     * Register channel for virtual city representation
     * @returns {void}
     * @listens VirtualCity#RadioRequestVirtualCityGetPlanningById
     * @listens VirtualCity#RadioRequestVirtualCityGetPlannings
     * @listens VirtualCity#RadioRequestVirtualCityActivatePlanning
     * @listens VirtualCity#RadioRequestVirtualCityDeactivatePlanning
     * @listens VirtualCity#RadioRequestVirtualCityGetViewpointsForPlanning
     * @listens VirtualCity#RadioRequestVirtualCityGetFlightsForPlanning
     * @listens VirtualCity#RadioRequestVirtualCityGotoViewPoint
     */
    addRadio: function () {
        const channel = Radio.channel("VirtualCity");

        channel.reply({
            "getPlanningById": this.getPlanningById,
            "getPlannings": this.getPlannings,
            "activatePlanning": this.activatePlanning,
            "deactivatePlanning": this.deactivatePlanning,
            "getViewpointsForPlanning": this.getViewpointsForPlanning,
            "getFlightsForPlanning": this.getFlightsForPlanning,
            "gotoViewPoint": this.gotoViewPoint
        }, this);
    },

    /**
     * returns a planning either from the cache or from the server request
     * @param {string} planningId id of the planningInstance
     * @return {Promise} Promise which resolves with the requested Planning
     */
    getPlanningById (planningId) {
        return this.getPlannings().then(()=>{
            if (this.get("planningCache")[planningId]) {
                return this.get("planningCache")[planningId];
            }
            throw new Error("Could not find Planning");
        });
    },
    /**
     * returns a list of plannings from a virtualcityPLANNER Service
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @return {Promise} Promise which resolves with an array of the public Plannings
     */
    getPlannings () {
        if (!this.get("readyPromise")) {
            const service = Radio.request("RestReader", "getServiceById", this.get("serviceId")),
                /**
                 * @deprecated in the next major-release!
                 * useProxy
                 * getProxyUrl()
                 */
                url = this.get("useProxy") ? getProxyUrl(service.get("url")) : service.get("url");

            if (!service) {
                return Promise.reject(new Error("Could not find service"));
            }
            this.set("readyPromise", axios.post(`${service.get("url")}/planning/list`, {mapId: service.get("scenarioId")})
                .then((response) => {
                    const data = response.data;

                    if (Array.isArray(data)) {
                        data.forEach((planningData)=> {
                            const planning = new Planning(Object.assign(planningData, {url: url, id: planningData._id}));

                            this.get("planningCache")[planning.id] = planning;
                        }, this);
                    }
                }));
        }
        return this.get("readyPromise").then(() => {
            return Object.values(this.get("planningCache"));
        });
    },

    /**
     * activates a Planning identified by the given planningId
     * @param {string} planningId id of the planningInstance
     * @return {Promise} Promise which resolves when the planning has been loaded and activated
     */
    activatePlanning (planningId) {
        return this.getPlanningById(planningId).then((planning) => {
            return planning.activate();
        });
    },

    /**
     * deactivates a Planning identified by the given planningId
     * @param {string} planningId id of the planningInstance
     * @return {Promise} Promise which resolves when the planning has been loaded and deactivated
     */
    deactivatePlanning (planningId) {
        return this.getPlanningById(planningId).then((planning) => {
            return planning.deactivate();
        });
    },

    /**
     * returns viewpoints by the given planningId
     * @param {string} planningId id of the planningInstance
     * @return {Promise} Promise which resolves with the list of viewpoints
     */
    getViewpointsForPlanning (planningId) {
        return this.getPlanningById(planningId).then((planning) => {
            return planning.getViewpoints().map((value) => {
                return value.name;
            });
        });
    },

    /**
     * returns flightInstances by the given planningId
     * @param {string} planningId id of the planningInstance
     * @return {Promise<Array<FlightInstance>>} Promise which resolves with the list of viewpoints
     */
    getFlightsForPlanning (planningId) {
        return this.getPlanningById(planningId).then((planning) => {
            return planning.getFlights();
        });
    },

    /**
     * sets the camera to the specific viewpoint
     * @param {string} planningId id of the planningInstance
     * @param {string} viewpointId id of the viewpoint
     * @return {Promise} Promise which resolves when the planning is loaded and the 3D Camera is set to the viewpoint
     */
    gotoViewPoint (planningId, viewpointId) {
        return this.getPlanningById(planningId).then((planning) => {
            return planning.gotoViewpoint(viewpointId);
        });
    }
});

export default VirtualCity;
