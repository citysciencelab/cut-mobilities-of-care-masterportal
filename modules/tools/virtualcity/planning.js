import axios from "axios";
import EntitiesLayer from "../../core/modelList/layer/entities";
import Tileset from "../../core/modelList/layer/tileset";


const Planning = Backbone.Model.extend(/** @lends Planning.prototype */ {
    defaults: _.extend({}, Backbone.Model.defaults, {
        id: null,
        url: null,
        hiddenObjects: [],
        planningObjects: [],
        viewpoints: []
    }),

    /**
     * @class Planning
     * @extends Backbone.Model
     * @description Planning Instance of the virtualcitysystems PlanningService, a container for 3d models, vector layer and viewpoints
     * @memberof Tools.VirtualCity
     * @constructs
     * @property {string} id - id of the planning
     * @property {string} url - url of the virtualcitysystems planning service
     * @property {Array} hiddenObjects - list of ids to hide in the base datasets
     * @property {Array} planningObjects - list of planningObjects
     * @property {Array} viewpoints - list of planning viewpoints
     */
    initialize () {
        this.readyPromise = null;
        this.entitiesLayer = null;
        this.defaultViewpoint = null;
        this.planningTilesetInstances = [];
    },

    /**
     * initializes the Planning, fetches the data from the server and creates all the layer elements
     * @return {Promise} Promise which resolves when the planning is loaded.
     * @listens VirtualCity#RadioTriggerMapChange
     */
    initializePlanning: function () {
        if (!this.readyPromise) {
            const promises = [];

            this.entitiesLayer = new EntitiesLayer({});
            this.entitiesLayer.initialize();
            this.entitiesLayer.prepareLayerObject();
            this.get("planningObjects").forEach((planningObjectData)=> {
                if (planningObjectData.status === "ready" && planningObjectData.visibility === true) {
                    if (planningObjectData.type === "gltf") {
                        const entityOptions = planningObjectData.modelMeta;

                        this.entitiesLayer.addEntityFromOptions(Object.assign(entityOptions, {
                            url: `${this.get("url")}${planningObjectData.url}`
                        }));
                    }
                    else if (planningObjectData.type === "featureStore") {
                        // eslint-disable-next-line no-underscore-dangle
                        promises.push(axios.get(`${this.get("url")}/planning/feature-store/get-layer?planningId=${this.get("id")}&planningObjectId=${planningObjectData._id}`)
                            .then((response) => {
                                const data = response.data;

                                if (data.staticRepresentation && data.staticRepresentation.threeDim) {
                                    const tileset = new Tileset({
                                        url: `${this.get("url")}/${data.staticRepresentation.threeDim}`
                                    });

                                    tileset.initialize();
                                    tileset.prepareLayerObject();
                                    tileset.setVectorStyle(data.vcsMeta.style || {});
                                    this.planningTilesetInstances.push(tileset);
                                }
                            })
                            .catch((err) => {
                                console.error(err);
                            }));
                    }
                }
            });
            this.listenTo(Radio.channel("Map"), {
                "change": (map) => {
                    if (map === "3D") {
                        this.deactivate();
                    }
                }
            });

            this.get("viewpoints").forEach((vp)=>{
                if (vp.default === true) {
                    this.defaultViewpoint = vp;
                }
            });
            this.readyPromise = Promise.all(promises);
        }
        return this.readyPromise;
    },

    /**
     * activates the planning project and jumps to the default Viewpoint
     * @returns {Promise} promise which returns when the planning has been loaded and activated
     * @fires Planning#RadioTriggerMapActivateMap3d
     * @fires Planning#RadioTriggerMapSetCameraParameter
     */
    activate () {
        if (!Radio.request("Map", "isMap3d")) {
            Radio.trigger("Map", "activateMap3d");
        }
        return this.initializePlanning().then(() => {
            if (this.defaultViewpoint) {
                Radio.trigger("Map", "setCameraParameter", this.defaultViewpoint);
            }
            this.entitiesLayer.setVisible(true);
            this.entitiesLayer.set("isSelected", true, {silent: true});
            this.entitiesLayer.toggleLayerOnMap();
            this.setHiddenObjects();
            this.planningTilesetInstances.forEach((layer)=> {
                layer.setVisible(true);
                layer.set("isSelected", true, {silent: true});
                layer.toggleLayerOnMap();
            });
        });
    },
    /**
     * deactivates the planning project and jumps to the default Viewpoint
     * @returns {Promise} promise which returns when the planning has been loaded and deactivated
     */
    deactivate () {
        return this.initializePlanning().then(() => {
            this.entitiesLayer.setVisible(false);
            this.entitiesLayer.set("isSelected", false, {silent: true});
            this.clearHiddenObjects();
            this.planningTilesetInstances.forEach((layer)=> {
                layer.set("isSelected", false, {silent: true});
                layer.setVisible(false);
            });
        });
    },
    /**
     * goto the specific viewpoint
     * @param {string} viewpointId viewpointId
     * @returns {void} -
     * @fires Planning#RadioTriggerMapSetCameraParameter
     */
    gotoViewpoint (viewpointId) {
        if (this.get("viewpoints")[viewpointId]) {
            Radio.trigger("Map", "setCameraParameter", this.get("viewpoints")[viewpointId]);
        }
    },

    /**
     * sets the ids of the hiddenObjects to the existing compatible layers
     * @returns {void} -
     */
    setHiddenObjects () {
        const layers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "TileSet3D"});

        layers.forEach((layer) =>{
            layer.hideObjects(this.get("hiddenObjects"));
        });
    },

    /**
     * clears the ids of the hiddenObjects to the existing compatible layers
     * @returns {void} -
     */
    clearHiddenObjects () {
        const layers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "TileSet3D"});

        layers.forEach((layer) =>{
            layer.showObjects(this.get("hiddenObjects"));
        });
    },

    /**
     * returns the viewpoint Objects of this planning
     * @returns {Array<Object>} list of viewpoint objects
     */
    getViewpoints () {
        return this.get("viewpoints");
    }
});


export default Planning;
