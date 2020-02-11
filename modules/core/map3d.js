import moment from "moment";
import OLCesium from "olcs/OLCesium.js";
import VectorSynchronizer from "olcs/VectorSynchronizer.js";
import FixedOverlaySynchronizer from "./3dUtils/fixedOverlaySynchronizer.js";
import WMSRasterSynchronizer from "./3dUtils/wmsRasterSynchronizer.js";
import {transform, get} from "ol/proj.js";

const Map3dModel = Backbone.Model.extend({
    defaults: {
        shadowTime: Cesium.JulianDate.fromDate(moment().hour(13).minute(0).second(0).millisecond(0).toDate())
    },

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
        Radio.trigger("Alert", "alert", "Der 3D-Modus befindet sich zur Zeit noch in der Beta-Version!");
        Radio.trigger("Map", "change", "3D");
    },

    prepareScene: function (scene) {
        this.handle3DEvents(scene);
        this.setCesiumSceneDefaults(scene);
    },

    prepareCamera: function (scene) {
        const camera = scene.camera,
            cameraParameter = Config.hasOwnProperty("cameraParameter") ? Config.cameraParameter : null;

        if (cameraParameter) {
            this.setCameraParameter(cameraParameter);
        }
        camera.changed.addEventListener(this.reactToCameraChanged, this);
    },

    deactivateOblique: function () {
        Radio.once("Map", "change", function (onceMapMode) {
            if (onceMapMode === "2D") {
                this.activateMap3d();
            }
        }.bind(this));
        Radio.trigger("ObliqueMap", "deactivate");
    },

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
            Radio.trigger("Map", "clickedWindowPosition", {position: event.position, pickedPosition: transformedPickedPosition, coordinate: transformedCoords, latitude: coords[0], longitude: coords[1], resolution: resolution, originalEvent: event, map: Radio.request("Map", "getMap")});
        }
    },

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
            });
        }
    },

    reactToCameraChanged: function () {
        const map3d = this.get("map3d"),
            camera = map3d.getCamera();

        Radio.trigger("Map", "cameraChanged", {"heading": camera.getHeading(), "altitude": camera.getAltitude(), "tilt": camera.getTilt()});
    },

    handle3DEvents: function (scene) {
        let eventHandler;

        if (window.Cesium) {
            eventHandler = new window.Cesium.ScreenSpaceEventHandler(scene.canvas);
            eventHandler.setInputAction(this.reactTo3DClickEvent.bind(this), window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    },

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

    createMap3d: function () {
        var map3d = new OLCesium({
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

    isMap3d: function () {
        return this.get("map3d") && this.get("map3d").getEnabled();
    },

    getShadowTime: function () {
        return this.get("shadowTime");
    },

    setShadowTime: function (value) {
        this.set("shadowTime", value);
    },

    setMap3d: function (map3d) {
        this.set("map3d", map3d);
    }

});

export default Map3dModel;
