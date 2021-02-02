import moment from "moment";
import OLCesium from "olcs/OLCesium.js";
import VectorSynchronizer from "olcs/VectorSynchronizer.js";
import FixedOverlaySynchronizer from "./3dUtils/fixedOverlaySynchronizer.js";
import WMSRasterSynchronizer from "./3dUtils/wmsRasterSynchronizer.js";
import {transform, get} from "ol/proj.js";
import Store from "../../src/app-store";

const Map3dModel = Backbone.Model.extend(/** @lends Map3dModel.prototype*/{
    defaults: {
        shadowTime: window.Cesium ? Cesium.JulianDate.fromDate(moment().hour(13).minute(0).second(0).millisecond(0).toDate()) : undefined
    },
    /**
     * @class Map3dModel
     * @extends Backbone.Model
     * @memberof Core
     * @constructs
     * @property {Cesium.JulianDate} shadowTime Current time in julian format.
     * @listens Core#RadioRequestMapIsMap3d
     * @listens Core#RadioRequestGetMap3d
     * @listens Core#RadioRequestMapGetFeatures3dAtPosition
     * @listens Core#RadioTriggerMapSetShadowTime
     * @listens Core#RadioTriggerMapActivateMap3d
     * @listens Core#RadioTriggerMapDeactivateMap3d
     * @listens Core#RadioTriggerMapSetCameraParameter
     * @listens Core#RadioTriggerMapChange
     * @fires Core#RadioRequestMapGetMapMode
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapChange
     * @fires Core#RadioTriggerObliqueMapDeactivate
     * @fires Core#RadioRequestMapViewGetProjection
     * @fires Core#RadioRequestMapClickedWindowPosition
     * @fires Core#RadioRequestMapGetMap
     * @fires Core#RadioTriggerMapCameraChanged
     */
    initialize: function () {
        const channel = Radio.channel("Map");

        channel.reply({
            "isMap3d": this.isMap3d,
            "getMap3d": function () {
                return this.get("map3d");
            },
            "getFeatures3dAtPosition": this.getFeatures3dAtPosition
        }, this);

        channel.on({
            "setShadowTime": this.setShadowTime,
            "activateMap3d": this.activateMap3d,
            "deactivateMap3d": this.deactivateMap3d,
            "setCameraParameter": this.setCameraParameter
        }, this);
        if (Config.startingMap3D) {
            this.activateMap3d();
        }
    },

    /**
     * Activates the map3d if it not already set.
     * If mapmode is "Oblique" it deactivates it.
     * @fires Core#RadioRequestMapGetMapMode
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapChange
     * @returns {void}
     */
    activateMap3d: function () {
        const mapMode = Radio.request("Map", "getMapMode");
        let map3d = this.get("map3d"),
            scene;

        if (this.isMap3d()) {
            return;
        }
        else if (mapMode === "Oblique") {
            this.deactivateOblique();
            return;
        }
        else if (!map3d) {
            Radio.trigger("Map", "beforeChange", "3D");
            map3d = this.createMap3d();
            scene = map3d.getCesiumScene();
            this.prepareScene(scene);
            this.setMap3d(map3d);
            this.prepareCamera(scene);
        }
        map3d.setEnabled(true);
        Radio.trigger("Map", "change", "3D");
        Store.commit("Map/setMapMode", 1);
    },

    /**
     * Prepares the cesium scene.
     * @param {Cesium.scene} scene Cesium scene.
     * @returns {void}
     */
    prepareScene: function (scene) {
        this.handle3DEvents(scene);
        this.setCesiumSceneDefaults(scene);
    },

    /**
     * Prepares the camera and listens to camera changed events.
     * @param {Cesium.scene} scene Cesium scene.
     * @returns {void}
     */
    prepareCamera: function (scene) {
        const camera = scene.camera,
            cameraParameter = Config.hasOwnProperty("cameraParameter") ? Config.cameraParameter : null;

        if (cameraParameter) {
            this.setCameraParameter(cameraParameter);
        }
        camera.changed.addEventListener(this.reactToCameraChanged, this);
    },

    /**
     * Deactivates oblique mode and listens to change event to activate 3d mode.
     * @listens Core#RadioTriggerMapChange
     * @fires Core#RadioTriggerObliqueMapDeactivate
     * @returns {void}
     */
    deactivateOblique: function () {
        Radio.once("Map", "change", function (onceMapMode) {
            if (onceMapMode === "2D") {
                this.activateMap3d();
            }
        }.bind(this));
        Radio.trigger("ObliqueMap", "deactivate");
    },

    /**
     * Reacts to 3d click event in cesium scene.
     * @param {Event} event The cesium event.
     * @fires Core#RadioRequestMapViewGetProjection
     * @fires Core#RadioRequestMapClickedWindowPosition
     * @fires Core#RadioRequestMapGetMap
     * @returns {void}
     */
    reactTo3DClickEvent: function (event) {
        const map3d = this.get("map3d"),
            scene = map3d.getCesiumScene(),
            ray = scene.camera.getPickRay(event.position),
            cartesian = scene.globe.pick(ray, scene),
            mapProjection = Radio.request("MapView", "getProjection");
        let height,
            coords,
            cartographic,
            distance,
            resolution,
            transformedCoords,
            transformedPickedPosition,
            pickedPositionCartesian,
            cartographicPickedPosition;

        if (cartesian) {
            if (document.querySelector(".nav li")?.classList.contains("open")) {
                document.querySelector(".nav li").classList.remove("open");
            }
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

            Store.dispatch("Map/updateClick", {map3d, position: event.position, pickedPosition: transformedPickedPosition, coordinate: transformedCoords, latitude: coords[0], longitude: coords[1], resolution: resolution, originalEvent: event, map: Radio.request("Map", "getMap")});
            Radio.trigger("Map", "clickedWindowPosition", {position: event.position, pickedPosition: transformedPickedPosition, coordinate: transformedCoords, latitude: coords[0], longitude: coords[1], resolution: resolution, originalEvent: event, map: Radio.request("Map", "getMap")});
        }
    },

    /**
     * Deactivates the 3d mode.
     * @fires Core#RadioRequestMapGetMap
     * @fires Core#RadioTriggerMapBeforeChange
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerMapChange
     * @returns {void}
     */
    deactivateMap3d: function () {
        const map3d = this.get("map3d"),
            map = Radio.request("Map", "getMap"),
            view = map.getView();
        let resolution,
            resolutions;

        if (map3d) {
            Radio.trigger("Map", "beforeChange", "2D");
            view.animate({rotation: 0}, function () {
                map3d.setEnabled(false);
                view.setRotation(0);
                resolution = view.getResolution();
                resolutions = view.getResolutions();
                if (resolution > resolutions[0]) {
                    view.setResolution(resolutions[0]);
                }
                if (resolution < resolutions[resolutions.length - 1]) {
                    view.setResolution(resolutions[resolutions.length - 1]);
                }
                Radio.trigger("Alert", "alert:remove");
                Radio.trigger("Map", "change", "2D");
                Store.commit("Map/setMapMode", 0);
            });
        }
    },

    /**
     * Reacts if the camera has changed.
     * @fires Core#RadioTriggerMapCameraChanged
     * @returns {void}
     */
    reactToCameraChanged: function () {
        const map3d = this.get("map3d"),
            camera = map3d.getCamera();

        Radio.trigger("Map", "cameraChanged", {"heading": camera.getHeading(), "altitude": camera.getAltitude(), "tilt": camera.getTilt()});
    },

    /**
     * Logic to listen to click events in 3d mode.
     * @param {Cesium.scene} scene Cesium scene.
     * @returns {void}
     */
    handle3DEvents: function (scene) {
        let eventHandler;

        if (window.Cesium) {
            eventHandler = new window.Cesium.ScreenSpaceEventHandler(scene.canvas);
            eventHandler.setInputAction(this.reactTo3DClickEvent.bind(this), window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    },

    /**
     * Retrieves the features that are at a given 3d coordinate.
     * @param {Number[]} position 3d coordinate array.
     * @returns {Object[]} - found objects
     */
    getFeatures3dAtPosition: function (position) {
        const map3d = this.get("map3d");
        let scene,
            objects;

        if (map3d) {
            scene = map3d.getCesiumScene();
            objects = scene.drillPick(position);
        }
        return objects;
    },

    /**
     * Sets the camera parameters either from config or from an trigger.
     * @param {Object} params Params.
     * @returns {void}
     */
    setCameraParameter: function (params) {
        const map3d = this.get("map3d");
        let camera,
            destination,
            orientation;

        // if the cameraPosition is given, directly set the cesium camera position, otherwise use olcesium Camera
        if (map3d && params.cameraPosition) {
            camera = map3d.getCesiumScene().camera;
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
        else if (map3d !== undefined && params !== null) {
            camera = map3d.getCamera();
            if (params.hasOwnProperty("tilt")) {
                camera.setTilt(parseFloat(params.tilt));
            }
            if (params.hasOwnProperty("heading")) {
                camera.setHeading(parseFloat(params.heading));
            }
            if (params.hasOwnProperty("altitude")) {
                camera.setAltitude(parseFloat(params.altitude));
            }
        }
    },

    /**
     * Sets the cesium scene defaults from the config.js
     * @param {Cesium.scene} scene Cesium scene.
     * @returns {void}
     */
    setCesiumSceneDefaults: function (scene) {
        let params;

        if (Config.hasOwnProperty("cesiumParameter")) {
            params = Config.cesiumParameter;
            if (params.hasOwnProperty("fog")) {
                scene.fog.enabled = params.fog.hasOwnProperty("enabled") ? params.fog.enabled : scene.fog.enabled;
                scene.fog.density = params.fog.hasOwnProperty("density") ? parseFloat(params.fog.density) : scene.fog.density;
                scene.fog.screenSpaceErrorFactor = params.fog.hasOwnProperty("screenSpaceErrorFactor") ? parseFloat(params.fog.screenSpaceErrorFactor) : scene.fog.screenSpaceErrorFactor;
            }

            scene.globe.tileCacheSize = params.hasOwnProperty("tileCacheSize") ? parseInt(params.tileCacheSize, 10) : scene.globe.tileCacheSize;
            scene.globe.maximumScreenSpaceError = params.hasOwnProperty("maximumScreenSpaceError") ? params.maximumScreenSpaceError : scene.globe.maximumScreenSpaceError;
            scene.shadowMap.maximumDistance = 5000.0;
            scene.shadowMap.darkness = 0.6;
            scene.shadowMap.size = 2048;
            scene.fxaa = params.hasOwnProperty("fxaa") ? params.fxaa : scene.fxaa;
            scene.globe.enableLighting = params.hasOwnProperty("enableLighting") ? params.enableLighting : scene.globe.enableLighting;
            scene.globe.depthTestAgainstTerrain = true;
            scene.highDynamicRange = false;
            scene.pickTranslucentDepth = true;
            scene.camera.enableTerrainAdjustmentWhenLoading = true;
        }
    },

    /**
     * Creates the olcesium  3d map.
     * @fires Core#RadioRequestMapGetMap
     * @returns {OLCesium} - ol cesium map.
     */
    createMap3d: function () {
        const map3d = new OLCesium({
            map: Radio.request("Map", "getMap"),
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
     * Checks if map in in 3d mode
     * @returns {Boolean} Flag if map is in 3d mode and enabled.
     */
    isMap3d: function () {
        return this.get("map3d") && this.get("map3d").getEnabled();
    },

    /**
     * Returns the shadowTime.
     * @returns {Cesium.JulianDate} - shadow time in julian date format.
     */
    getShadowTime: function () {
        return this.get("shadowTime");
    },

    /**
     * Setter for attribute "shadowTime".
     * @param {Cesium.JulianDate} shadowTime Shadow time in julian date format.
     * @returns {void}
     */
    setShadowTime: function (shadowTime) {
        this.set("shadowTime", shadowTime);
    },

    /**
     * Setter for attribute "map3d".
     * @param {OLCesium} map3d ol cesium map.
     * @returns {void}
     */
    setMap3d: function (map3d) {
        this.set("map3d", map3d);
        Store.commit("Map/setMap3d", map3d);
    }

});

export default Map3dModel;
