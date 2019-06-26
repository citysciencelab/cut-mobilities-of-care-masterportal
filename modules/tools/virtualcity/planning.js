import axios from "axios";
import EntitiesLayer from "../../core/modelList/layer/entities";
import Tileset from "../../core/modelList/layer/tileset";


/**
 * @class
 * @description
 *
 */
export default class Planning {
    constructor (config) {

        // eslint-disable-next-line no-underscore-dangle
        this.id = config._id;

        this.url = config.url;

        this.hiddenObjects = config.hiddenObjects;

        this.planningObjects = [];

        this.config = config;

        this.readyPromise = null;
    }

    /**
     * @returns {Promise} -
     */
    initialize () {
        if (!this.readyPromise) {
            const promises = [];

            this.entitiesLayer = new EntitiesLayer({});
            this.entitiesLayer.initialize();
            this.entitiesLayer.prepareLayerObject();
            this.config.planningObjects.forEach((planningObjectData)=> {
                if (planningObjectData.type === "gltf") {
                    const entityOptions = planningObjectData.modelMeta;

                    this.entitiesLayer.addEntityFromOptions(Object.assign(entityOptions, {
                        url: `${this.url}${planningObjectData.url}`
                    }));
                }
                else if (planningObjectData.type === "featureStore") {
                    // eslint-disable-next-line no-underscore-dangle
                    promises.push(axios.get(`${this.url}/planning/feature-store/get-layer?planningId=${this.id}&planningObjectId=${planningObjectData._id}`)
                        .then((response)=> {
                            const data = response.data;

                            if (data.staticRepresentation && data.staticRepresentation.threeDim) {
                                const tileset = new Tileset({
                                    url: `${this.url}/${data.staticRepresentation.threeDim}`
                                });

                                tileset.initialize();
                                tileset.prepareLayerObject();
                                tileset.setVectorStyle(data.vcsMeta.style || {});
                                this.planningObjects.push(tileset);
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                        }));
                }
            });

            this.viewpoints = [];
            this.config.viewpoints.forEach(this.addViewpoint.bind(this));
            this.readyPromise = Promise.all(promises);
        }
        return this.readyPromise;
    }


    addViewpoint (viewpointData) {
        this.viewpoints.push(viewpointData);
        if (viewpointData.default === true) {
            this.defaultViewpoint = viewpointData;
        }
    }

    /**
     * activates the planning project and jumps to the default Viewpoint
     * @returns {Promise} promise which returns when the planning has been loaded and activated
     */
    activate () {
        return this.initialize().then(() => {
            if (this.defaultViewpoint) {
                Radio.trigger("Map", "setCameraParameter", this.defaultViewpoint);
            }
            this.entitiesLayer.setVisible(true);
            this.entitiesLayer.set("isSelected", true, {silent: true});
            this.entitiesLayer.toggleLayerOnMap();
            this.setHiddenObjects();
            this.planningObjects.forEach((layer)=> {
                layer.setVisible(true);
                layer.set("isSelected", true, {silent: true});
                layer.toggleLayerOnMap();
            });
        });
    }

    /**
     * deactivates the planning project and jumps to the default Viewpoint
     * @returns {Promise} promise which returns when the planning has been loaded and deactivated
     */
    deactivate () {
        return this.initialize().then(() => {
            this.entitiesLayer.setVisible(false);
            this.clearHiddenObjects();
            this.planningObjects.forEach((layer)=> {
                layer.setVisible(false);
            });
        });
    }

    /**
     * goto the specific viewpoint
     * @param {string} viewpointId viewpointId
     * @returns {void} -
     */
    gotoViewpoint (viewpointId) {
        if (this.viewpoints[viewpointId]) {
            Radio.trigger("Map", "setCameraParameter", this.viewpoints[viewpointId]);
        }
    }

    setHiddenObjects () {
        const layers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "TileSet3D"});

        layers.forEach((layer) =>{
            layer.hideObjects(this.hiddenObjects);
        });
    }

    clearHiddenObjects () {
        const layers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "TileSet3D"});

        layers.forEach((layer) =>{
            layer.showObjects(this.hiddenObjects);
        });
    }
}
