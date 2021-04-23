import normalizeLayers from "./normalizeLayers";
import * as highlightFeature from "./highlightFeature";
import * as removeHighlightFeature from "./removeHighlighting";
import {getWmsFeaturesByMimeType} from "../../../../api/gfi/getWmsFeaturesByMimeType";
import {MapMode} from "../enums";
import getProxyUrl from "../../../../utils/getProxyUrl";

let unsubscribes = [],
    loopId = null;

/**
 * When map module is done, the normalized layers should be constructed on the fly when adding layers.
 * For now, these processes happen independently of each other, so we need a hack to get the data.
 * TODO remove this once all layers are added/removed with an action (~= replace map.js with this module)
 * @param {Function} commit commit function
 * @param {module:ol/Map} map ol map
 * @returns {void}
 */
function loopLayerLoader (commit, map) {
    clearInterval(loopId);
    loopId = setInterval(() => {
        const [layers, layerIds] = normalizeLayers(map.getLayers().getArray());

        commit("setLayers", layers);
        commit("setLayerIds", layerIds);
    }, 5000);
}

const actions = {
    /**
     * Sets the map to the store. As a side-effect, map-related functions are registered
     * to fire changes when required. Each time a new map is registered, all old listeners
     * are discarded and new ones are registered.
     * @param {Object} state state object
     * @param {module:ol/Map} map map object
     * @returns {void}
     */
    setMap ({commit, dispatch}, {map}) {
        // discard old listeners
        if (unsubscribes.length) {
            unsubscribes.forEach(unsubscribe => unsubscribe());
            unsubscribes = [];
        }

        const mapView = map.getView();

        // set map to store
        commit("setMap", map);
        commit("setLayerList", map.getLayers().getArray());

        // update state once initially to get initial settings
        dispatch("updateViewState");

        // hack: see comment on function
        loopLayerLoader(commit, map);

        // currently has no change mechanism
        commit("setProjection", mapView.getProjection());

        // note initial values for quick comparisons/resets
        commit("setInitialZoomLevel", mapView.getZoom());
        commit("setInitialCenter", mapView.getCenter());
        commit("setInitialResolution", mapView.getResolution());

        // register listeners with state update functions
        unsubscribes = [
            map.on("moveend", evt => dispatch("updateViewState", evt)),
            map.on("pointermove", evt => dispatch("updatePointer", evt)),
            map.on("click", evt => dispatch("updateClick", evt)),
            map.on("change:size", evt => commit("setSize", evt.target.getSize()))
        ];
    },

    /**
     * @param {Function} commit commit function
     * @param {MapBrowserEvent} evt - Moveend event
     * @returns {Function} update function for state parts to update onmoveend
     */
    updateViewState ({commit, getters}, evt) {
        let map;

        if (evt) {
            map = evt.map;
        }
        else {
            ({map} = getters);
        }

        const mapView = map.getView();

        commit("setZoomLevel", mapView.getZoom());
        commit("setMaxZoomLevel", mapView.getMaxZoom());
        commit("setMinZoomLevel", mapView.getMinZoom());
        commit("setResolution", mapView.getResolution());
        commit("setMaxResolution", mapView.getMaxResolution());
        commit("setMinResolution", mapView.getMinResolution());
        commit("setBbox", mapView.calculateExtent(map.getSize()));
        commit("setRotation", mapView.getRotation());
        commit("setCenter", mapView.getCenter());
    },
    /**
     * @param {Function} commit commit function
     * @param {Object} evt update event
     * @returns {Function} update function for mouse coordinate
     */
    updatePointer ({commit}, evt) {
        if (evt.dragging) {
            return;
        }
        commit("setMouseCoord", evt.coordinate);
    },

    /**
     * Updates the click coordinate and the related pixel depending on the map mode.
     * If Gfi Tool is active, the features of this coordinate/pixel are set.
     * @param {Object} store.getters - the map getters
     * @param {Function} store.commit - function to commit a mutation
     * @param {Function} store.dispatch - function to dipatch a action
     * @param {Object} store.rootGetters - the store getters
     * @param {MapBrowserEvent} evt - Click event in 2D, fake click event in 3D
     * @returns {void}
     */
    updateClick ({getters, commit, dispatch, rootGetters}, evt) {
        const {mapMode} = getters;

        if (mapMode === MapMode.MODE_2D) {
            commit("setClickCoord", evt.coordinate);
            commit("setClickPixel", evt.pixel);
        }
        else {
            commit("setClickCoord", evt.pickedPosition);
            commit("setClickPixel", [evt.position.x, evt.position.y]);
            commit("setMap3d", evt.map3d);
        }

        if (rootGetters["Tools/Gfi/active"]) {
            commit("setGfiFeatures", null);
            dispatch("MapMarker/removePolygonMarker", null, {root: true});
            dispatch("collectGfiFeatures");
        }

        if (!rootGetters["controls/orientation/poiModeCurrentPositionEnabled"]) {
            dispatch("MapMarker/placingPointMarker", evt.coordinate, {root: true});
            commit("controls/orientation/setPosition", evt.coordinate, {root: true});
            commit("controls/orientation/setShowPoi", true, {root: true});
        }
    },

    /**
     * collects features for the gfi.
     * @param {Object} store context
     * @param {Object} store.getters - the map getters
     * @param {Function} store.commit - function to commit a mutation
     * @returns {void}
     */
    collectGfiFeatures ({getters, commit, dispatch}) {
        const {clickCoord, visibleWmsLayerListAtResolution, resolution, projection, gfiFeaturesAtPixel} = getters,
            gfiWmsLayerList = visibleWmsLayerListAtResolution.filter(layer => {
                return layer.get("gfiAttributes") !== "ignore";
            });

        Promise.all(gfiWmsLayerList.map(layer => {
            const gfiParams = {
                INFO_FORMAT: layer.get("infoFormat"),
                FEATURE_COUNT: layer.get("featureCount")
            };
            let url = layer.getSource().getFeatureInfoUrl(clickCoord, resolution, projection, gfiParams);

            /**
             * @deprecated in the next major-release!
             * useProxy
             * getProxyUrl()
             */
            url = layer.get("useProxy") ? getProxyUrl(url) : url;

            return getWmsFeaturesByMimeType(layer, url);
        }))
            .then(gfiFeatures => {
                // only commit if features found
                if (gfiFeaturesAtPixel.concat(...gfiFeatures).length > 0) {
                    commit("setGfiFeatures", gfiFeaturesAtPixel.concat(...gfiFeatures));
                }
            })
            .catch(error => {
                console.warn(error);
                dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.gfi.errorMessage"), {root: true});
            });
    },

    /**
     * Sets a new zoom level to map and store. All other fields will be updated onmoveend.
     * @param {Object} state state object
     * @param {Number} zoomLevel zoom level
     * @returns {void}
     */
    setZoomLevel ({getters, commit}, zoomLevel) {
        const {maxZoomLevel, minZoomLevel} = getters;

        if (zoomLevel <= maxZoomLevel && zoomLevel >= minZoomLevel) {
            getters.map.getView().setZoom(zoomLevel);
            commit("setZoomLevel", zoomLevel);
        }
    },
    increaseZoomLevel ({dispatch, getters}) {
        dispatch("setZoomLevel", getters.zoomLevel + 1);
    },
    decreaseZoomLevel ({dispatch, getters}) {
        dispatch("setZoomLevel", getters.zoomLevel - 1);
    },
    /**
     * Turns a visible layer invisible and the other way around.
     * @param {Object} state state object
     * @param {String} layerId id of the layer to toggle visibility of
     * @returns {void}
     */
    toggleLayerVisibility ({getters, commit}, {layerId}) {
        const layer = getters.layers[layerId];

        if (layer) {
            const nextVisibility = !layer.olLayer.getVisible();

            layer.olLayer.setVisible(nextVisibility);
            commit("setLayerVisibility", {layerId, visibility: nextVisibility});
            return;
        }

        console.warn(`No layer with id ${layerId} found to toggle visibility of.`);
    },
    /**
     * Sets the opacity of a layer.
     * @param {Object} actionParams first action parameter
     * @param {Object} payload parameter object
     * @param {String} payload.layerId id of layer to change opacity of
     * @param {Number} payload.value opacity value in range (0, 1)
     * @returns {void}
     */
    setLayerOpacity ({getters, commit}, {layerId, value}) {
        const layer = getters.layers[layerId];

        if (!layer) {
            console.warn(`No layer with id ${layerId} found to set opacity of.`);
            return;
        }

        layer.olLayer.setOpacity(value);
        commit("setLayerOpacity", {layerId, opacity: value});
    },
    /**
     * Sets center and resolution to initial values.
     * @param {Object} actionParams first action parameter
     * @returns {void}
     */
    resetView ({state, dispatch}) {
        const {initialCenter, initialResolution, map} = state,
            view = map.getView();

        view.setCenter(initialCenter);
        view.setResolution(initialResolution);

        dispatch("MapMarker/removePointMarker", null, {root: true});
    },
    /**
     * Sets the resolution by the given index of available resolutions.
     * NOTE: is used by scaleSwitcher tutorial.
     * @param {Number} index of the resolution
     * @returns {void}
     */
    setResolutionByIndex ({state}, index) {
        const {map} = state,
            view = map.getView();

        view.setResolution(view.getResolutions()[index]);
    },
    /**
     * Adds a listener to maps pointermove and calls callback-funktion
     * @param {Object} state state object
     * @param {Function} callback  to be called on pointermove
     * @returns {void}
     */
    addPointerMoveHandler ({state}, callback) {
        const {map} = state;

        if (callback) {
            map.on("pointermove", e => callback(e));
        }

    },
    /**
     * Removes a listener from maps pointermove
     * @param {Object} state state object
     * @param {Function} callback  to be called on pointermove
     * @returns {void}
     */
    removePointerMoveHandler ({state}, callback) {
        const {map} = state;

        map.un("pointermove", e => callback(e));
    },
    /**
     * Adds an interaction to the map.
     * @param {module:ol/interaction/Interaction} interaction - Interaction to be added to map.
     * @returns {void}
     */
    addInteraction ({state}, interaction) {
        const {map} = state;

        map.addInteraction(interaction);
    },
    /**
     * Removes an interaction from the map.
     * @param {module:ol/interaction/Interaction} interaction - Interaction to be removed from map.
     * @returns {void}
     */
    removeInteraction ({state}, interaction) {
        const {map} = state;

        map.removeInteraction(interaction);
    },
    /**
     * Zoom to the given geometry or extent based on the current map size.
     * @param {Object} getters - the map getters
     * @param {module:ol/geom/SimpleGeometry | module:ol/extent} geometryOrExtent - The geometry or extent to zoom to.
     * @param {Object} options - @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#fit|Openlayers}
     * @returns {void}
     */
    zoomTo ({getters}, geometryOrExtent, options) {
        const {map} = getters;

        map.getView().fit(geometryOrExtent, {
            duration: options?.duration ? options.duration : 800,
            ...options
        });
    },
    ...highlightFeature,
    ...removeHighlightFeature

};

export default actions;
