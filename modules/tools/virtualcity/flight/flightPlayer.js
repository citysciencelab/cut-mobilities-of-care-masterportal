/**
 * @typedef {Object} FlightPlayer.Values
 * @property {boolean} [playing=false]
 * @property {boolean} [paused=false]
 * @property {number} [multiplier=1]
 * @property {boolean} [repeat=false]
 * @property {boolean} [valid=false]
 * @property {FlightInstance|null} activeInstance
 */

/**
 * @typedef {Object} FlightPlayer.Clock
 * @property {number} startTime
 * @property {number} endTime
 * @property {number} currentTime
 * @property {number|null} currentSystemTime
 * @property {Array<number>} times
 */

class FlightPlayer {
    /**
     * @class FlightPlayer
     * @constructs
     * @memberof Tools.VirtualCity
     * @name FlightPlayer
     * @description FlightPlayer to control the 3D Map to fly on a predefined path. This is a singleton, use getInstance method to get the instance
     *
     * @listens Map#RadioTriggerMapChange
     * @listens FlightPlayer#RadioRequestFlightPlayerStop
     * @listens FlightPlayer#RadioRequestFlightPlayerPlay
     * @listens FlightPlayer#RadioRequestFlightPlayerGetValues
     */
    constructor () {
        /**
         * @type {Cesium.LinearSpline|Cesium.CatmullRomSpline}
         * @private
         */
        this.destinationSpline = null;
        /**
         * @type {Cesium.QuaternionSpline}
         * @private
         */
        this.quaternionSpline = null;
        /**
         * @type {FlightPlayer.Values}
         */
        this.values = {
            playing: false,
            paused: false,
            multiplier: 1,
            activeInstance: null,
            repeat: false,
            valid: false
        };

        /**
         * @type {FlightPlayer.Clock}
         */
        this.clock = {
            startTime: 0,
            endTime: 0,
            currentTime: 0,
            times: [],
            currentSystemTime: null
        };

        /**
         * @type {Function}
         * @private
         */
        this.postRenderHandler = null;


        /**
         * @type {Cesium.ScreenSpaceCameraController|null}
         * @private
         */
        this.screenSpaceCameraController = null;

        // stop player if the map is changed to 2D or oblique
        Radio.on("Map", "change", (map) => {
            if (map !== "3D") {
                this.stop();
            }
        });

        const channel = Radio.channel("FlightPlayer");

        channel.reply({
            "stop": this.stop,
            "play": this.play,
            "getValues": () => {
                return this.values;
            }
        }, this);
    }

    /**
     * @param {FlightInstance} flightInstance -
     * @return {void} -
     */
    setActiveFlightInstance (flightInstance) {
        if (this.values.playing) {
            this.stop();
        }
        this.values.activeInstance = flightInstance;
        this.updateSplines();
    }

    /**
     * @return {void} -
     */
    clearActiveFlight () {
        if (this.values.playing) {
            this.stop();
        }

        this.values.activeInstance = null;
    }

    /**
     * starts playing either the given flightInstance or the activeInstance
     * @param {FlightInstance|undefined} flightInstance -
     * @return {void} -
     * @fires Map#RadioRequestMapIsMap3d
     * @fires Map#RadioRequestMapGetMap3d
     */
    play (flightInstance) {
        if (!Radio.request("Map", "isMap3d")) {
            return;
        }

        if (!flightInstance && !this.values.activeInstance) {
            const message = "Player cannot play without activeInstance, provide a flightInstance or call setActiveInstance";

            throw new Error(message);
        }
        if (this.postRenderHandler) {
            this.postRenderHandler();
            this.postRenderHandler = null;
        }

        if (flightInstance && this.values.activeInstance !== flightInstance) {
            this.setActiveFlightInstance(flightInstance);
        }

        const scene = Radio.request("Map", "getMap3d").getCesiumScene();

        this.screenSpaceCameraController = scene.screenSpaceCameraController;
        this.postRenderHandler = scene.postRender.addEventListener(this.cesiumPostRender.bind(this));

        this.clock.currentSystemTime = null;
        this.values.playing = true;
    }

    /**
     * stops the active flight and sets the currentTime to 0
     * @return {void} -
     */
    stop () {
        if (this.postRenderHandler) {
            this.postRenderHandler();
            this.postRenderHandler = null;
        }

        if (this.screenSpaceCameraController) {
            this.screenSpaceCameraController.enableInputs = true;
        }

        this.values.playing = false;
        this.values.paused = false;

        this.clock.currentTime = 0;
        this.clock.currentSystemTime = null;
    }

    /**
     * @param {Cesium.Scene} scene -
     * @return {void} -
     * @private
     */
    cesiumPostRender (scene) {
        const time = Date.now() / 1000;
        var seconds, view;

        if (!this.clock.currentSystemTime) {
            this.clock.currentSystemTime = time;
        }
        seconds = time - this.clock.currentSystemTime;
        this.clock.currentSystemTime = time;
        if (this.values.paused) {
            if (this.screenSpaceCameraController) {
                this.screenSpaceCameraController.enableInputs = true;
            }
            return;
        }

        this.clock.currentTime += seconds * this.values.multiplier;
        if (this.clock.currentTime > this.clock.endTime) {
            if (this.values.repeat) {
                this.clock.currentTime = this.clock.currentTime - this.clock.endTime;
            }
            else {
                this.stop();
                return;
            }
        }
        else if (this.clock.currentTime < this.clock.startTime) {
            if (this.values.repeat) {
                this.clock.currentTime = this.clock.endTime + this.clock.currentTime;
            }
            else {
                this.clock.currentTime = this.clock.startTime;
                return;
            }
        }

        view = {
            destination: this.destinationSpline.evaluate(this.clock.currentTime),
            orientation: Cesium.HeadingPitchRoll.fromQuaternion(this.quaternionSpline.evaluate(this.clock.currentTime))
        };
        scene.camera.setView(view);
        if (this.screenSpaceCameraController) {
            this.screenSpaceCameraController.enableInputs = false;
        }
    }

    /**
     * @private
     * @return {void} -
     */
    updateSplines () {
        const viewpoints = this.values.activeInstance.get("viewpoints"),
            loop = this.values.activeInstance.get("loop"),
            length = loop ? viewpoints.length + 1 : viewpoints.length,
            points = new Array(length),
            quaternions = new Array(length),
            times = new Array(length);

        viewpoints.forEach((vp, index) => {
            points[index] = Cesium.Cartesian3.fromDegrees(vp.cameraPosition[0], vp.cameraPosition[1], vp.cameraPosition[2]);
            quaternions[index] = Cesium.Quaternion
                .fromHeadingPitchRoll(Cesium.HeadingPitchRoll.fromDegrees(vp.heading, vp.pitch, vp.roll));

            if (index > 0) {
                const prev = viewpoints[index - 1];

                if (!prev.duration) {
                    prev.duration = (Cesium.Cartesian3.distance(points[index - 1], points[index]) / 300) || 1;
                }
                times[index] = times[index - 1] + prev.duration;
            }
            else {
                times[index] = 0;
            }
        });
        if (loop) {
            points[length - 1] = Cesium.Cartesian3.fromDegrees(viewpoints[0].cameraPosition[0], viewpoints[0].cameraPosition[1], viewpoints[0].cameraPosition[2]);
            quaternions[length - 1] = Cesium.Quaternion.fromHeadingPitchRoll(Cesium.HeadingPitchRoll.fromDegrees(viewpoints[0].heading, viewpoints[0].pitch, viewpoints[0].roll));

            if (!viewpoints[length - 2].duration) {
                viewpoints[length - 2].duration = Cesium.Cartesian3.distance(points[length - 2], points[length - 1]) / 300;
            }
            times[length - 1] = times[length - 2] + viewpoints[length - 2].duration;
        }

        this.destinationSpline = this.values.activeInstance.get("interpolation") === "spline" ?
            new Cesium.CatmullRomSpline({times, points}) :
            new Cesium.LinearSpline({times, points});
        this.quaternionSpline = new Cesium.QuaternionSpline({times, points: quaternions});

        this.clock.endTime = times[length - 1];
        this.clock.times = times;
        this.values.repeat = loop;
    }
}

/**
 * only exported for testing purposes, use getInstance
 */
export default FlightPlayer;

let instance;

/**
 * returns the singleton flightPlayerInstance
 * @return {FlightPlayer} -
 * @memberOf Tools.VirtualCity
 */
export function getInstance () {
    if (!instance) {
        instance = new FlightPlayer();
    }
    return instance;
}
