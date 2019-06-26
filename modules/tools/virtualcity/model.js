import axios from "axios";
import Planning from "./planning";
import Tool from "../../core/modelList/tool/model";
/**
 * @class
 * @description
 *
 */

const Virtualcity = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        planningCache: {},
        readyPromise: {}
    }),

    initialize () {
        var channel = Radio.channel("virtualcityPLANNER");

        channel.reply({
            "getPlanningById": this.getPlanningById,
            "getPlannings": this.getPlannings,
            "activatePlanning": this.activatePlanning,
            "deactivatePlanning": this.deactivatePlanning,
            "getViewpointsForPlanning": this.getViewpointsForPlanning,
            "gotoViewPoint": this.gotoViewPoint
        }, this);
    },

    /**
     * returns a planning either from the cache or from the server request
     * @param {string} serviceId id of the virtualcityPLANNER Service
     * @param {string} planningId id of the planningInstance
     * @return {Promise} Promise which resolves with the requested Planning
     */
    getPlanningById (serviceId, planningId) {
        return this.getPlannings(serviceId).then(()=>{
            if (this.get("planningCache")[serviceId] && this.get("planningCache")[serviceId][planningId]) {
                return this.get("planningCache")[serviceId][planningId];
            }
            throw new Error("Could not find Planning");
        });
    },
    /**
     * returns a list of plannings from a virtualcityPLANNER Service
     * @param {string} serviceId id of the virtualcityPLANNER Service
     * @return {Promise} Promise which resolves with an array of the public Plannings
     */
    getPlannings (serviceId) {
        if (this.get("planningCache")[serviceId]) {
            return Promise.resolve(Object.values(this.get("planningCache")[serviceId]));
        }
        if (!this.get("readyPromise")[serviceId]) {
            const service = Radio.request("RestReader", "getServiceById", serviceId);

            if (!service) {
                return Promise.reject(new Error("Could not find service"));
            }
            this.get("readyPromise")[serviceId] = axios.post(`${service.get("url")}/planning/list`, {mapId: service.get("scenarioId")})
                .then((response) => {
                    const data = response.data;

                    if (_.isArray(data)) {
                        data.forEach((planningData)=> {
                            const planning = new Planning(Object.assign(planningData, {url: service.get("url")}));

                            if (!this.get("planningCache")[serviceId]) {
                                this.get("planningCache")[serviceId] = {};
                            }
                            this.get("planningCache")[serviceId][planning.id] = planning;
                        }, this);
                    }
                });
        }
        return this.get("readyPromise")[serviceId].then(() => {
            return Object.values(this.get("planningCache")[serviceId]);
        });
    },

    /**
     * activates a Planning identified by the given serviceId and planningId
     * @param {string} serviceId id of the virtualcityPLANNER Service
     * @param {string} planningId id of the planningInstance
     * @return {Promise} Promise which resolves when the planning has been loaded and activated
     */
    activatePlanning (serviceId, planningId) {
        return this.getPlanningById(serviceId, planningId).then((planning) => {
            return planning.activate();
        });
    },

    /**
     * deactivates a Planning identified by the given serviceId and planningId
     * @param {string} serviceId id of the virtualcityPLANNER Service
     * @param {string} planningId id of the planningInstance
     * @return {Promise} Promise which resolves when the planning has been loaded and deactivate
     */
    deactivatePlanning (serviceId, planningId) {
        return this.getPlanningById(serviceId, planningId).then((planning) => {
            return planning.deactivate();
        });
    },

    /**
     * deactivates a Planning identified by the given serviceId and planningId
     * @param {string} serviceId id of the virtualcityPLANNER Service
     * @param {string} planningId id of the planningInstance
     * @return {Promise} Promise which resolves with the list of viewpoints
     */
    getViewpointsForPlanning (serviceId, planningId) {
        return this.getPlanningById(serviceId, planningId).then((planning) => {
            return planning.flights.map((value) => {
                return value.name;
            });
        });
    },

    /**
     * sets the camera to the specific viewpoint
     * @param {string} serviceId id of the virtualcityPLANNER Service
     * @param {string} planningId id of the planningInstance
     * @param {string} viewpointId id of the viewpoint
     * @return {Promise} Promise which resolves with the list of viewpoints
     */
    gotoViewPoint (serviceId, planningId, viewpointId) {
        return this.getPlanningById(serviceId, planningId).then((planning) => {
            return planning.gotoViewpoint(viewpointId);
        });
    }
});

export default Virtualcity;