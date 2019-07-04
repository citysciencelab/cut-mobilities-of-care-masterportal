import axios from "axios";
import Planning from "./planning";
import Tool from "../../core/modelList/tool/model";

const VirtualCityModel = Tool.extend(/** @lends VirtualCityModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        planningCache: {},
        readyPromise: null
    }),

    /**
     * @class VirtualCityModel
     * @extends Tool
     * @memberof Tool.VirtualCity
     * @constructs
     * @property {String} glyphicon="glyphicon-envelope" Glyhphicon that is shown before the tool name
     * @property {String} serviceID=undefined Id of service in rest-services.json thats contains the service url
     * @fires ContactModel#changeInvalid
     * @listens VirtualCity#RadioRequestVirtualCityGetPlanningById
     * @listens VirtualCity#RadioRequestVirtualCityGetPlannings
     * @listens VirtualCity#RadioRequestVirtualCityActivatePlanning
     * @listens VirtualCity#RadioRequestVirtualCityDeactivatePlanning
     * @listens VirtualCity#RadioRequestVirtualCitygetViewpointsForPlanning
     * @listens VirtualCity#RadioRequestVirtualCityGotoViewPoint
     * @fires RestReader#RadioRequestRestReaderGetServicebyId
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
     * @listens VirtualCity#RadioRequestVirtualCitygetViewpointsForPlanning
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
     * @fires RestReader#RadioRequestRestReaderGetServicebyId
     * @return {Promise} Promise which resolves with an array of the public Plannings
     */
    getPlannings () {
        if (!this.get("readyPromise")) {
            const service = Radio.request("RestReader", "getServiceById", this.get("serviceId"));

            if (!service) {
                return Promise.reject(new Error("Could not find service"));
            }
            this.set("readyPromise", axios.post(`${service.get("url")}/planning/list`, {mapId: service.get("scenarioId")})
                .then((response) => {
                    const data = response.data;

                    if (_.isArray(data)) {
                        data.forEach((planningData)=> {
                            const planning = new Planning(Object.assign(planningData, {url: service.get("url")}));

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
     * @return {Promise} Promise which resolves when the planning has been loaded and deactivate
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
            return planning.viewpoints.map((value) => {
                return value.name;
            });
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

export default VirtualCityModel;
