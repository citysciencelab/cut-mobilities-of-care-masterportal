import {unByKey as unlistenByKey} from "ol/Observable.js";
import VectorLayer from "ol/layer/Vector.js";
import {Group as LayerGroup} from "ol/layer.js";
import VectorSource from "ol/source/Vector.js";
import MapView from "./mapView";
import ObliqueMap from "./obliqueMap";
import OLCesium from "olcs/OLCesium.js";
import VectorSynchronizer from "olcs/VectorSynchronizer.js";
import FixedOverlaySynchronizer from "./3dUtils/FixedOverlaySynchronizer.js";
import WMSRasterSynchronizer from "./3dUtils/WMSRasterSynchronizer.js";
import {transform, get} from "ol/proj.js";
import moment from "moment";
import {register} from "ol/proj/proj4.js";
import proj4 from "proj4";
import {createMap} from "masterportalAPI";
import {getLayerList} from "masterportalAPI/src/rawLayerList";
import {transformToMapProjection} from "masterportalAPI/src/crs";
import {transform as transformCoord, transformFromMapProjection, getMapProjection} from "masterportalAPI/src/crs";

const map = Backbone.Model.extend(/** @lends map.prototype */{
    defaults: {
        initalLoading: 0,
        shadowTime: null
    },

    /**
     * @class map
     * @description todo
     * @extends Backbone.Model
     * @memberOf Core
     * @constructs
     * @param {Object} mapViewSettings Settings for the map.
     * @property {Number} initalLoading=0 todo
     * @property {Cesium.JulianDate} shadowTime=null DefaultTime for 3D rendering even with disabled shadows.
     * @listens Core#RadioRequestMapGetLayers
     * @listens Core#RadioRequestMapGetWGS84MapSizeBBOX
     * @listens Core#RadioRequestMapCreateLayerIfNotExists
     * @listens Core#RadioRequestMapGetSize
     * @listens Core#RadioRequestMapGetFeaturesAtPixel
     * @listens Core#RadioRequestMapRegisterListener
     * @listens Core#RadioRequestMapGetMap
     * @listens Core#RadioRequestMapIsMap3d
     * @listens Core#RadioRequestMapGetMap3d
     * @listens Core#RadioRequestMapGetMapMode
     * @listens Core#RadioRequestMapGetFeatures3dAtPosition
     * @listens Core#RadioTriggerMapAddLayer
     * @listens Core#RadioTriggerMapAddLayerToIndex
     * @listens Core#RadioTriggerMapSetLayerToIndex
     * @listens Core#RadioTriggerMapAddLayerOnTop
     * @listens Core#RadioTriggerMapAddLoadingLayer
     * @listens Core#RadioTriggerMapAddOverlay
     * @listens Core#RadioTriggerMapAddInteraction
     * @listens Core#RadioTriggerMapAddControl
     * @listens Core#RadioTriggerMapRemoveLayer
     * @listens Core#RadioTriggerMapRemoveLoadingLayer
     * @listens Core#RadioTriggerMapRemoveOverlay
     * @listens Core#RadioTriggerMapRemoveInteraction
     * @listens Core#RadioTriggerMapSetBBox
     * @listens Core#RadioTriggerMapRender
     * @listens Core#RadioTriggerMapZoomToExtent
     * @listens Core#RadioTriggerMapZoomToFilteredFeatures
     * @listens Core#RadioTriggerMapRegisterListener
     * @listens Core#RadioTriggerMapUnregisterListener
     * @listens Core#RadioTriggerMapUpdateSize
     * @listens Core#RadioTriggerMapSetShadowTime
     * @listens Core#RadioTriggerMapActivateMap3d
     * @listens Core#RadioTriggerMapDeactivateMap3d
     * @listens Core#RadioTriggerMapSetCameraParameter
     * @listens Core#RadioTriggerMapChange
     * @listens Core#MapChangeVectorLayer
     * @fires Core.ModelList#RadioTriggerModelListAddInitiallyNeededModels
     * @fires Core#RadioRequestParametricURLGetZoomToExtent
     * @fires Core#RadioTriggerMapIsReady
     * @fires MapMarker#RadioTriggerMapMarkerShowMarker
     * @fires Core#RadioTriggerMapViewSetCenter
     * @fires RemoteInterface#RadioTriggerRemoteInterfacePostMessage
     * @fires Core#RadioTriggerMapChange
     * @fires Core#RadioTriggerObliqueMapDeactivate
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioRequestMapViewGetProjection
     * @fires Core#RadioRequestMapClickedWindowPosition
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Core#RadiotriggerMapCameraChanged
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @fires Core#RadioTriggerUtilShowLoader
     * @fires Core#RadioTriggerUtilHideLoader
     * @fires Core#RadioTriggerMapAddLayerToIndex
     */
    initialize: function (mapViewSettings) {
        const channel = Radio.channel("Map");

        this.listenTo(this, "change:initalLoading", this.initalLoadingChanged);

        channel.reply({
            "getLayers": this.getLayers,
            "getWGS84MapSizeBBOX": this.getWGS84MapSizeBBOX,
            "createLayerIfNotExists": this.createLayerIfNotExists,
            "getSize": this.getSize,
            "getFeaturesAtPixel": this.getFeaturesAtPixel,
            "registerListener": this.registerListener,
            "getMap": function () {
                return this.get("map");
            },
            "isMap3d": this.isMap3d,
            "getMap3d": this.getMap3d,
            "getMapMode": this.getMapMode,
            "getFeatures3dAtPosition": this.getFeatures3dAtPosition
        }, this);

        channel.on({
            "addLayer": function (layer) {
                this.get("map").addLayer(layer);
            },
            "addLayerToIndex": this.addLayerToIndex,
            "setLayerToIndex": this.setLayerToIndex,
            "addLayerOnTop": this.addLayerOnTop,
            "addLoadingLayer": this.addLoadingLayer,
            "addOverlay": this.addOverlay,
            "addInteraction": this.addInteraction,
            "addControl": this.addControl,
            "removeControl": this.removeControl,
            "removeLayer": this.removeLayer,
            "removeLoadingLayer": this.removeLoadingLayer,
            "removeOverlay": this.removeOverlay,
            "removeInteraction": this.removeInteraction,
            "setBBox": this.setBBox,
            "render": this.render,
            "zoomToExtent": this.zoomToExtent,
            "zoomToFilteredFeatures": this.zoomToFilteredFeatures,
            "registerListener": this.registerListener,
            "unregisterListener": this.unregisterListener,
            "updateSize": function () {
                this.get("map").updateSize();
            },
            "setShadowTime": this.setShadowTime,
            "activateMap3d": this.activateMap3d,
            "deactivateMap3d": this.deactivateMap3d,
            "setCameraParameter": this.setCameraParameter
        }, this);

        this.listenTo(this, {
            "change:vectorLayer": function (model, value) {
                this.addLayerToIndex([value, 0]);
            }
        });

        /**
         * resolution
         * @deprecated in 3.0.0
         */
        if (mapViewSettings && mapViewSettings.hasOwnProperty("resolution")) {
            console.warn("MapView parameter 'resolution' is deprecated. Please use 'startResolution' instead.");
            mapViewSettings.startResolution = mapViewSettings.resolution;
        }
        /**
         * zoomLevel
         * @deprecated in 3.0.0
         */
        if (mapViewSettings && mapViewSettings.hasOwnProperty("zoomLevel")) {
            console.warn("MapView parameter 'zoomLevel' is deprecated. Please use 'startZoomLevel' instead.");
            mapViewSettings.startZoomLevel = mapViewSettings.zoomLevel;
        }

        this.setMap(createMap({
            ...Config,
            ...mapViewSettings,
            layerConf: getLayerList()
        }));

        new MapView({view: this.get("map").getView(), settings: mapViewSettings});
        this.set("view", this.get("map").getView());

        this.addAliasForWFSFromGoeserver(getMapProjection(this.get("map")));

        if (window.Cesium) {
            this.set("shadowTime", Cesium.JulianDate.fromDate(moment().hour(13).minute(0).second(0).millisecond(0).toDate()));
        }
        if (Config.obliqueMap) {
            this.set("obliqueMap", new ObliqueMap({}));
        }
        Radio.trigger("ModelList", "addInitiallyNeededModels");
        if (!_.isUndefined(Radio.request("ParametricURL", "getZoomToExtent"))) {
            this.zoomToExtent(Radio.request("ParametricURL", "getZoomToExtent"));
        }
        this.stopMouseMoveEvent();

        Radio.trigger("Map", "isReady", "gfi", false);
        if (Config.startingMap3D) {
            this.activateMap3d();
        }

        if (!_.isUndefined(Config.inputMap)) {
            this.registerListener("click", this.addMarker.bind(this));
        }
    },

    /**
     * Creates an alias for the srsName.
     * This is necessary for WFS from geoserver.org.
     * @param {String} epsgCode used epsg code in the mapView
     * @returns {void}
     */
    addAliasForWFSFromGoeserver: function (epsgCode) {
        const epsgCodeNumber = epsgCode.split(":")[1];

        proj4.defs("http://www.opengis.net/gml/srs/epsg.xml#" + epsgCodeNumber, proj4.defs(epsgCode));
        register(proj4);
    },

    /**
     * Function is registered as an event listener if the config-parameter "inputMap" is present
     * and always sets a mapMarker at the clicked position without activating it.
     * Also triggers the RemoteInterface with the marker coordinates.
     * @param  {event} event - The MapBrowserPointerEvent
     * @fires MapMarker#RadioTriggerMapMarkerShowMarker
     * @fires Core#RadioTriggerMapViewSetCenter
     * @fires RemoteInterface#RadioTriggerRemoteInterfacePostMessage
     * @returns {void}
     */
    addMarker: function (event) {
        var coords = event.coordinate;

        // Set the marker on the map.
        Radio.trigger("MapMarker", "showMarker", coords);

        // If the marker should be centered, center the map around it.
        if (!_.isUndefined(Config.inputMap.setCenter) && Config.inputMap.setCenter) {
            Radio.trigger("MapView", "setCenter", coords);
        }

        // Should the coordinates get transformed to another coordinate system for broadcast?
        if (!_.isUndefined(Config.inputMap.targetProjection)) {
            coords = transformFromMapProjection(this.get("map"), Config.inputMap.targetProjection, coords);
        }

        // Broadcast the coordinates clicked in the desired coordinate system.
        Radio.trigger("RemoteInterface", "postMessage", {"setMarker": coords});
    },

    /**
    * Finds a layer by its name and returns it.
    * @param  {string} layerName - Name of the Layers
    * @return {ol.layer} - found layer
    */
    getLayerByName: function (layerName) {
        var layers = this.get("map").getLayers().getArray();

        return _.find(layers, function (layer) {
            return layer.get("name") === layerName;
        });
    },

    /**
     * Setter for vectorLayer.
     * @param {*} value - todo
     * @returns {void}
     */
    setVectorLayer: function (value) {
        this.set("vectorLayer", value);
    },

    /**
     * Getter for Layers from the map.
     * @returns {*} layers from the map
     */
    getLayers: function () {
        return this.get("map").getLayers();
    },

    /**
     * Render the map
     * @returns {void}
     */
    render: function () {
        this.get("map").render();
    },

    /**
     * Sets the bounding box for the map.
     * @param {*} bbox - todo
     * @returns {void}
     */
    setBBox: function (bbox) {
        this.set("bbox", bbox);
        this.bBoxToMap(this.get("bbox"));
    },

    /**
     * todo
     * @param {*} bbox - todo
     * @returns {void}
     */
    bBoxToMap: function (bbox) {
        if (bbox) {
            this.get("view").fit(bbox, this.get("map").getSize());
        }
    },

    /**
     * todo
     * @returns {*} todo
     */
    getWGS84MapSizeBBOX: function () {
        var bbox = this.get("view").calculateExtent(this.get("map").getSize()),
            firstCoord = [bbox[0], bbox[1]],
            secondCoord = [bbox[2], bbox[3]],
            firstCoordTransform = transformCoord("EPSG:25832", "EPSG:4326", firstCoord),
            secondCoordTransform = transformCoord("EPSG:25832", "EPSG:4326", secondCoord);

        return [firstCoordTransform[0], firstCoordTransform[1], secondCoordTransform[0], secondCoordTransform[1]];
    },

    /**
    * Registered listener for certain events on the map.
    * See http://openlayers.org/en/latest/apidoc/ol.Map.html
    * @param {String} event - The Eventtype.
    * @param {Function} callback - The Callback function.
    * @param {Object} context - todo
    * @returns {*} todo
    */
    registerListener: function (event, callback, context) {
        return this.get("map").on(event, callback, context);
    },

    /**
    * Unsubscribes listener to certain events.
    * @param {String | Object} event - The event type or an object used as a key.
    * @param {Function} callback - The callback function.
    * @param {Object} context - todo
    * @returns {void}
    */
    unregisterListener: function (event, callback, context) {
        if (typeof event === "string") {
            this.get("map").un(event, callback, context);
        }
        else {
            unlistenByKey(event);
        }
    },

    /**
    * Return features at a pixel coordinate
    * @param  {pixel} pixel - Pixelcoordinate
    * @param  {object} options - layerDefinition and pixelTolerance
    * @returns {features[]} - Array with features
    */
    getFeaturesAtPixel: function (pixel, options) {
        return this.get("map").getFeaturesAtPixel(pixel, options);
    },

    /**
     * Returns the mapmode. Oblique, 3D and 2D are available for selection.
     * @returns {String} mapMode
     */
    getMapMode: function () {
        if (Radio.request("ObliqueMap", "isActive")) {
            return "Oblique";
        }
        else if (this.getMap3d() && this.getMap3d().getEnabled()) {
            return "3D";
        }
        return "2D";
    },

    /**
     * todo
     * @returns {*} todo
     */
    isMap3d: function () {
        return this.getMap3d() && this.getMap3d().getEnabled();
    },

    /**
     * Getter for shadowTime used in OLCesium
     * @returns {Cesium.JulianDate} shadowTime shadowTime
     */
    getShadowTime: function () {
        return this.get("shadowTime");
    },

    /**
     * create the map in 3d-mode.
     * @returns {*} 3D-Map
     */
    createMap3d: function () {
        var map3d = new OLCesium({
            map: this.get("map"),
            time: this.getShadowTime.bind(this),
            sceneOptions: {
                shadows: false
            },
            stopOpenLayersEventsPropagation: true,
            createSynchronizers: function (olMap, scene) {
                return [new WMSRasterSynchronizer(olMap, scene), new VectorSynchronizer(olMap, scene), new FixedOverlaySynchronizer(olMap, scene)];
            }
        });

        return map3d;
    },

    /**
     * todo
     * @returns {void}
     */
    handle3DEvents: function () {
        var eventHandler;

        if (window.Cesium) {
            eventHandler = new window.Cesium.ScreenSpaceEventHandler(this.getMap3d().getCesiumScene().canvas);
            eventHandler.setInputAction(this.reactTo3DClickEvent.bind(this), window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    },

    /**
     * todo
     * @param {*} params - todo
     * @returns {void}
     */
    setCameraParameter: function (params) {
        var map3d = this.getMap3d(),
            camera,
            destination,
            orientation;

        // if the cameraPosition is given, directly set the cesium camera position, otherwise use olcesium Camera
        if (map3d && params.cameraPosition) {
            camera = this.getMap3d().getCesiumScene().camera;
            destination = Cesium.Cartesian3.fromDegrees(params.cameraPosition[0], params.cameraPosition[1], params.cameraPosition[2]);
            orientation = {
                heading: Cesium.Math.toRadians(parseFloat(params.heading)),
                pitch: Cesium.Math.toRadians(parseFloat(params.pitch)),
                roll: Cesium.Math.toRadians(parseFloat(params.roll))
            };

            camera.setView({
                destination,
                orientation
            });
        }
        else if (_.isUndefined(map3d) === false && _.isNull(params) === false) {
            camera = map3d.getCamera();
            if (_.has(params, "tilt")) {
                camera.setTilt(parseFloat(params.tilt));
            }
            if (_.has(params, "heading")) {
                camera.setHeading(parseFloat(params.heading));
            }
            if (_.has(params, "altitude")) {
                camera.setAltitude(parseFloat(params.altitude));
            }
        }
    },

    /**
     * todo
     * @returns {*} todo
     */
    setCesiumSceneDefaults: function () {
        var params,
            scene = this.getMap3d().getCesiumScene();

        if (_.has(Config, "cesiumParameter")) {
            params = Config.cesiumParameter;
            if (_.has(params, "fog")) {
                scene.fog.enabled = _.has(params.fog, "enabled") ? params.fog.enabled : scene.fog.enabled;
                scene.fog.density = _.has(params.fog, "density") ? parseFloat(params.fog.density) : scene.fog.density;
                scene.fog.screenSpaceErrorFactor = _.has(params.fog, "screenSpaceErrorFactor") ? parseFloat(params.fog.screenSpaceErrorFactor) : scene.fog.screenSpaceErrorFactor;
            }

            scene.globe.tileCacheSize = _.has(params, "tileCacheSize") ? parseInt(params.tileCacheSize, 10) : scene.globe.tileCacheSize;
            scene.globe.maximumScreenSpaceError = _.has(params, "maximumScreenSpaceError") ? params.maximumScreenSpaceError : scene.globe.maximumScreenSpaceError;
            scene.shadowMap.maximumDistance = 5000.0;
            scene.shadowMap.darkness = 0.6;
            scene.shadowMap.size = 2048; // this is default
            scene.fxaa = _.has(params, "fxaa") ? params.fxaa : scene.fxaa;
            scene.globe.enableLighting = _.has(params, "enableLighting") ? params.enableLighting : scene.globe.enableLighting;
            scene.globe.depthTestAgainstTerrain = true;
            scene.highDynamicRange = false;
            scene.pickTranslucentDepth = true;
            scene.camera.enableTerrainAdjustmentWhenLoading = true;
        }
        return scene;
    },

    /**
     * Activates the 3d Map, if oblique is still active, the obliquemap will be deactivated before.
     * @listens Core#RadioTriggerMapChange
     * @fires Core#RadioTriggerObliqueMapDeactivate
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapChange
     * @return {void}
     */
    activateMap3d: function () {
        var camera,
            cameraParameter = _.has(Config, "cameraParameter") ? Config.cameraParameter : null;

        if (this.isMap3d()) {
            return;
        }
        if (this.getMapMode() === "Oblique") {
            Radio.once("Map", "change", function (mapMode) {
                if (mapMode === "2D") {
                    this.activateMap3d();
                }
            }.bind(this));
            Radio.trigger("ObliqueMap", "deactivate");
            return;
        }
        Radio.trigger("Map", "beforeChange", "3D");
        if (!this.getMap3d()) {
            this.setMap3d(this.createMap3d());
            this.handle3DEvents();
            this.setCesiumSceneDefaults();
            this.setCameraParameter(cameraParameter);
            camera = this.getMap3d().getCesiumScene().camera;
            camera.changed.addEventListener(this.reactToCameraChanged, this);
        }
        this.getMap3d().setEnabled(true);
        Radio.trigger("Alert", "alert", "Der 3D-Modus befindet sich zur Zeit noch in der Beta-Version!");
        Radio.trigger("Map", "change", "3D");
    },

    /**
     * todo
     * @param {*} position - todo
     * @returns {*} todo
     */
    getFeatures3dAtPosition: function (position) {
        var scene,
            objects;

        if (this.getMap3d()) {
            scene = this.getMap3d().getCesiumScene();
            objects = scene.drillPick(position);
        }
        return objects;
    },

    /**
     * todo
     * @param {*} event - todo
     * @fires Core#RadioRequestMapViewGetProjection
     * @fires Core#RadioRequestMapClickedWindowPosition
     * @returns {void}
     */
    reactTo3DClickEvent: function (event) {
        var map3d = this.getMap3d(),
            scene = map3d.getCesiumScene(),
            ray = scene.camera.getPickRay(event.position),
            cartesian = scene.globe.pick(ray, scene),
            height,
            coords,
            cartographic,
            distance,
            resolution,
            mapProjection = Radio.request("MapView", "getProjection"),
            transformedCoords,
            transformedPickedPosition,
            pickedPositionCartesian,
            cartographicPickedPosition;

        if (cartesian) {
            cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            coords = [window.Cesium.Math.toDegrees(cartographic.longitude), window.Cesium.Math.toDegrees(cartographic.latitude)];
            height = scene.globe.getHeight(cartographic);
            if (height) {
                coords = coords.concat([height]);
            }

            distance = window.Cesium.Cartesian3.distance(cartesian, scene.camera.position);
            resolution = map3d.getCamera().calcResolutionForDistance(distance, cartographic.latitude);
            transformedCoords = transform(coords, get("EPSG:4326"), mapProjection);
            transformedPickedPosition = null;

            if (scene.pickPositionSupported) {
                pickedPositionCartesian = scene.pickPosition(event.position);
                if (pickedPositionCartesian) {
                    cartographicPickedPosition = scene.globe.ellipsoid.cartesianToCartographic(pickedPositionCartesian);
                    transformedPickedPosition = transform([window.Cesium.Math.toDegrees(cartographicPickedPosition.longitude), window.Cesium.Math.toDegrees(cartographicPickedPosition.latitude)], get("EPSG:4326"), mapProjection);
                    transformedPickedPosition.push(cartographicPickedPosition.height);
                }
            }
            Radio.trigger("Map", "clickedWindowPosition", {position: event.position, pickedPosition: transformedPickedPosition, coordinate: transformedCoords, latitude: coords[0], longitude: coords[1], resolution: resolution, originalEvent: event, map: this.get("map")});
        }
    },

    /**
     * Deactivates the 3D map and changes to the 2D Map Mode.
     * @fires Core#RadioTriggerMapChange
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @return {void}
     */
    deactivateMap3d: function () {
        var resolution,
            resolutions;

        if (this.getMap3d()) {
            Radio.trigger("Map", "beforeChange", "2D");
            this.get("view").animate({rotation: 0}, function () {
                this.getMap3d().setEnabled(false);
                this.get("view").setRotation(0);
                resolution = this.get("view").getResolution();
                resolutions = this.get("view").getResolutions();
                if (resolution > resolutions[0]) {
                    this.get("view").setResolution(resolutions[0]);
                }
                if (resolution < resolutions[resolutions.length - 1]) {
                    this.get("view").setResolution(resolutions[resolutions.length - 1]);
                }
                Radio.trigger("Alert", "alert:remove");
                Radio.trigger("Map", "change", "2D");
            }.bind(this));
        }
    },

    /**
     * Setter for map3d.
     * @param {*} map3d - todo
     * @returns {*} todo
     */
    setMap3d: function (map3d) {
        return this.set("map3d", map3d);
    },

    /**
     * Getter for map3d.
     * @returns {*} todo
     */
    getMap3d: function () {
        return this.get("map3d");
    },

    /**
     * todo
     * @fires Core#RadiotriggerMapCameraChanged
     * @returns {void}
     */
    reactToCameraChanged: function () {
        var camera = this.getMap3d().getCamera();

        Radio.trigger("Map", "cameraChanged", {"heading": camera.getHeading(), "altitude": camera.getAltitude(), "tilt": camera.getTilt()});
    },

    /**
     * Adds an interaction to the map.
     * @param {*} interaction - Interaction to be added.
     * @returns {void}
     */
    addInteraction: function (interaction) {
        this.get("map").addInteraction(interaction);
    },

    /**
     * Removes an interaction from the map.
     * @param {*} interaction - Interaction to be remove.
     * @returns {void}
     */
    removeInteraction: function (interaction) {
        this.get("map").removeInteraction(interaction);
    },

    /**
     * Adds an ovleray to the map.
     * @param {*} overlay - Overlay to be added.
     * @returns {void}
     */
    addOverlay: function (overlay) {
        this.get("map").addOverlay(overlay);
    },

    /**
     * Removes an overlay from the map.
     * @param {*} overlay - Overlay to be removed.
     * @returns {void}
     */
    removeOverlay: function (overlay) {
        this.get("map").removeOverlay(overlay);
    },

    /**
     * Adds a control to the map.
     * @param {*} control - Control to be added.
     * @returns {void}
     */
    addControl: function (control) {
        this.get("map").addControl(control);
    },

    /**
     * Removes a control from the map.
     * @param {*} control - Control to be removed.
     * @returns {void}
     */
    removeControl: function (control) {
        this.get("map").removeControl(control);
    },

    /**
     * Put the layer on top of the map.
     * @param {ol/layer} layer - To be placed on top of the map.
     * @returns {void}
     */
    addLayerOnTop: function (layer) {
        this.get("map").getLayers().push(layer);
    },

    /**
     * Removes a layler from the map.
     * @param {*} layer - - Layer to be removed.
     * @returns {void}
     */
    removeLayer: function (layer) {
        this.get("map").removeLayer(layer);
    },

    /**
    * Moves the layer on the map to the intended position.
    * @param {Array} args - [0] = Layer, [1] = Index
    * @returns {void}
    */
    addLayerToIndex: function (args) {
        var layer = args[0],
            index = args[1],
            channel = Radio.channel("Map"),
            layersCollection = this.get("map").getLayers();

        // if the layer is already at the correct position, do nothing
        if (layersCollection.item(index) === layer) {
            return;
        }
        layersCollection.remove(layer);
        layersCollection.insertAt(index, layer);
        this.setImportDrawMeasureLayersOnTop(layersCollection);

        // Laden des Layers überwachen
        if (layer instanceof LayerGroup) {
            layer.getLayers().forEach(function (singleLayer) {
                singleLayer.getSource().on("wmsloadend", channel.trigger("removeLoadingLayer"), this);
                singleLayer.getSource().on("wmsloadstart", channel.trigger("addLoadingLayer"), this);
            });
        }
        else {
            layer.getSource().on("wmsloadend", channel.trigger("removeLoadingLayer"), this);
            layer.getSource().on("wmsloadstart", channel.trigger("addLoadingLayer"), this);
        }
    },

    /**
     * Sets an already inserted ol.layer to the defined index using openlayers setZIndex method
     * @param {ol.Layer} layer  - Layer to set.
     * @param {integer} [index=0] - New Index.
     * @returns {void}
     */
    setLayerToIndex: function (layer, index) {
        if (layer instanceof LayerGroup) {
            layer.getLayers().forEach(function (singleLayer) {
                singleLayer.setZIndex(parseInt(index, 10) || 0);
            });
        }
        else {
            layer.setZIndex(parseInt(index, 10) || 0);
        }
    },

    /**
     * Pushes 'alwaysOnTop' layers to the top of the collection.
     * @param {ol.Collection} layers - Layer Collection.
     * @returns {void}
     */
    setImportDrawMeasureLayersOnTop: function (layers) {
        const newIndex = layers.getLength(),
            layersOnTop = layers.getArray().filter(function (layer) {
                return layer.get("alwaysOnTop") === true;
            });

        _.each(layersOnTop, function (layer) {
            this.setLayerToIndex(layer, newIndex);
        }, this);
    },

    /**
     * todo
     * @param {*} extent - todo
     * @param {*} options - todo
     * @returns {void}
     */
    zoomToExtent: function (extent, options) {
        var extentToUse = extent;

        if (!_.isUndefined(this.get("projectionFromParamUrl"))) {
            const projectionGiven = this.get("projectionFromParamUrl"),
                leftBottom = extent.slice(0, 2),
                topRight = extent.slice(2, 4),
                transformedLeftBottom = transformToMapProjection(this.get("map"), projectionGiven, leftBottom),
                transformedTopRight = transformToMapProjection(this.get("map"), projectionGiven, topRight);

            extentToUse = transformedLeftBottom.concat(transformedTopRight);
        }
        this.get("view").fit(extentToUse, this.get("map").getSize(), options);
    },

    /**
     * todo
     * @param {*} ids - todo
     * @param {*} layerId - todo
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @returns {void}
     */
    zoomToFilteredFeatures: function (ids, layerId) {
        var extent,
            features,
            layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId, type: "layer"}),
            layerFeatures = [],
            olLayer = layer.get("layer");

        if (!_.isUndefined(layer) && olLayer instanceof LayerGroup) {
            olLayer.getLayers().forEach(function (child) {
                layerFeatures = child.getSource().getFeatures();
            });
        }
        else if (!_.isUndefined(layer) && !_.isUndefined(olLayer.getSource())) {
            layerFeatures = olLayer.getSource().getFeatures();
        }

        features = layerFeatures.filter(function (feature) {
            return _.contains(ids, feature.getId());
        });
        if (features.length > 0) {
            extent = this.calculateExtent(features);
            this.zoomToExtent(extent);
        }
    },

    /**
     * todo
     * @param {*} features - todo
     * @returns {*} todo
     */
    calculateExtent: function (features) {
        // extent = [xMin, yMin, xMax, yMax]
        var extent = [9999999, 9999999, 0, 0];

        _.each(features, function (feature) {
            var featureExtent = feature.getGeometry().getExtent();

            if (feature.getId() === "APP_STAATLICHE_SCHULEN_4099") {
                return;
            }
            extent[0] = featureExtent[0] < extent[0] ? featureExtent[0] : extent[0];
            extent[1] = featureExtent[1] < extent[1] ? featureExtent[1] : extent[1];
            extent[2] = featureExtent[2] > extent[2] ? featureExtent[2] : extent[2];
            extent[3] = featureExtent[3] > extent[3] ? featureExtent[3] : extent[3];
        });
        return extent;
    },

    /**
    * Returns the size in pixels of the map.
    * @returns {ol.Size} An array of two numbers [width, height].
    */
    getSize: function () {
        return this.get("map").getSize();
    },

    /**
     * todo
     * @returns {void}
     */
    addLoadingLayer: function () {
        this.set("initalLoading", this.get("initalLoading") + 1);
    },

    /**
     * todo
     * @returns {void}
     */
    removeLoadingLayer: function () {
        this.set("initalLoading", this.get("initalLoading") - 1);
    },

    /**
    * Initial loading. "initalLoading" is incremented across layers if several tiles are loaded and incremented again if the tiles are loaded.
    * Listener is then stopped so that the loader is only displayed during initial loading - not when zoom/pan is selected. [...]
    * @fires Core#RadioTriggerUtilShowLoader
    * @fires Core#RadioTriggerUtilHideLoader
    * @returns {void}
    */
    initalLoadingChanged: function () {
        var num = this.get("initalLoading");

        if (num > 0) {
            Radio.trigger("Util", "showLoader");
        }
        else if (num === 0) {
            Radio.trigger("Util", "hideLoader");
            this.stopListening(this, "change:initalLoading");
        }
    },

    /**
     * Checks if the layer with the name "Name" already exists and uses it, if not, creates a new layer.
     * @param {*} name - todo
     * @fires Core#RadioTriggerMapAddLayerToIndex
     * @returns {*} todo
     */
    createLayerIfNotExists: function (name) {
        var layers = this.getLayers(),
            found = false,
            layer,
            source,
            resultLayer = {};

        _.each(layers.getArray(), function (ollayer) {
            if (ollayer.get("name") === name) {
                found = true;
                resultLayer = ollayer;
            }
        }, this);

        if (!found) {
            source = new VectorSource();
            layer = new VectorLayer({
                name: name,
                source: source,
                alwaysOnTop: true
            });

            resultLayer = layer;
            Radio.trigger("Map", "addLayerToIndex", [layer, layers.getArray().length]);
        }
        return resultLayer;
    },

    /**
    * DThe ol-overlaycontainer-stopevent container does not stop every event.
    * Among other things the Mousemove Event. This method does that.
    * @see {@link https://github.com/openlayers/openlayers/issues/4953}
    * @returns {void}
    */
    stopMouseMoveEvent: function () {
        // Firefox & Safari.
        $(".ol-overlaycontainer-stopevent").on("mousemove", function (evt) {
            evt.stopPropagation();
        });
        $(".ol-overlaycontainer-stopevent").on("touchmove", function (evt) {
            evt.stopPropagation();
        });
        $(".ol-overlaycontainer-stopevent").on("pointermove", function (evt) {
            evt.stopPropagation();
        });
    },

    /**
     * Setter for shadowTime.
     * @param {*} value - todo
     * @returns {void}
     */
    setShadowTime: function (value) {
        this.set("shadowTime", value);
    },

    /**
     * Setter for the map.
     * @param {ol/map} value - The map.
     * @returns {void}
     */
    setMap: function (value) {
        this.set("map", value);
    }

});

export default map;
