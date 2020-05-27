const FlightPlayer = Backbone.Model.extend(/** @lends FlightPlayer.prototype */ {
    /**
     * @class FlightPlayer
     * @extends Backbone.Model
     * @description FlightPlayer to control the 3D Map to fly on a predefined path. This is a singleton, use getInstance method to get the instance
     * @memberof Tools.VirtualCity
     * @constructs
     * @property {boolean} [playing=false]
     * @property {boolean} [paused=false]
     * @property {number} [multiplier=1]
     * @property {boolean} [repeat=false]
     * @property {boolean} [valid=false]
     * @property {FlightInstance|null} activeInstance
     * @property {number} startTime
     * @property {number} endTime
     * @property {number} currentTime
     * @property {number|null} currentSystemTime
     * @property {Array<number>} times
     * @fires Core#RadioRequestMapIsMap3d
     * @fires Core#RadioRequestMapGetMap3d
     * @fires FlightPlayer#RadioTriggerFlightPlayerStateChange
     * @listens Core#RadioTriggerMapChange
     * @listens FlightPlayer#RadioRequestFlightPlayerStop
     * @listens FlightPlayer#RadioRequestFlightPlayerPlay
     * @listens FlightPlayer#RadioRequestFlightPlayerGetValues
     */
    defaults: Object.assign({}, Backbone.Model.defaults, {
        /**
         * @type {Cesium.LinearSpline|Cesium.CatmullRomSpline}
         * @private
         */
        destinationSpline: null,
        /**
         * @type {Cesium.QuaternionSpline}
         * @private
         */
        quaternionSpline: null,
        playing: false,
        paused: false,
        multiplier: 1,
        activeInstance: null,
        repeat: false,
        valid: false,
        startTime: 0,
        endTime: 0,
        currentTime: 0,
        times: [],
        currentSystemTime: null,
        /**
         * @type {Function}
         * @private
         */
        postRenderHandler: null,
        /**
         * @type {Cesium.ScreenSpaceCameraController|null}
         * @private
         */
        screenSpaceCameraController: null
    }),

    /**
     * @listens Core#RadioTriggerMapChange
     * @listens FlightPlayer#RadioRequestFlightPlayerStop
     * @listens FlightPlayer#RadioRequestFlightPlayerPlay
     * @listens FlightPlayer#RadioRequestFlightPlayerGetValues
     * @returns {void}
     */
    initialize () {
        const channel = Radio.channel("FlightPlayer");

        channel.reply({
            "stop": this.stop,
            "play": this.play,
            "getValues": () => {
                return {
                    playing: this.get("playing"),
                    paused: this.get("paused"),
                    multiplier: this.get("multiplier"),
                    activeInstance: this.get("activeInstance"),
                    repeat: this.get("repeat"),
                    valid: this.get("valid")
                };
            }
        }, this);

        // stop player if the map is changed to 2D or oblique
        Radio.on("Map", "change", (map) => {
            if (map !== "3D") {
                this.stop();
            }
        });
    },

    /**
     * @param {FlightInstance} flightInstance -
     * @return {void} -
     */
    setActiveFlightInstance (flightInstance) {
        if (this.get("playing")) {
            this.stop();
        }
        this.setActiveInstance(flightInstance);
        this.updateSplines();
    },

    /**
     * @return {void} -
     */
    clearActiveFlight () {
        if (this.get("playing")) {
            this.stop();
        }

        this.setActiveInstance(null);
    },

    /**
     * starts playing either the given flightInstance or the activeInstance
     * @param {FlightInstance|undefined} flightInstance -
     * @return {void} -
     * @fires Core#RadioRequestMapIsMap3d
     * @fires Core#RadioRequestMapGetMap3d
     * @fires FlightPlayer#RadioTriggerFlightPlayerStateChange
     */
    play (flightInstance) {
        const scene = Radio.request("Map", "getMap3d").getCesiumScene();

        if (!Radio.request("Map", "isMap3d")) {
            return;
        }

        if (!flightInstance && !this.get("activeInstance")) {
            const message = "Player cannot play without activeInstance, provide a flightInstance or call setActiveInstance";

            throw new Error(message);
        }
        if (this.get("postRenderHandler")) {
            this.get("postRenderHandler")();
            this.setPostRenderHandler(null);
        }

        if (flightInstance && this.get("activeInstance") !== flightInstance) {
            this.setActiveFlightInstance(flightInstance);
        }

        this.setScreenSpaceCameraController(scene.screenSpaceCameraController);
        this.setPostRenderHandler(scene.postRender.addEventListener(this.cesiumPostRender.bind(this)));

        this.setCurrentSystemTime(null);
        this.setPlaying(true);
        Radio.trigger("FlightPlayer", "stateChange", "play", this.get("activeInstance"));
    },

    /**
     * stops the active flight and sets the currentTime to 0
     * @return {void} -
     * @fires FlightPlayer#RadioTriggerFlightPlayerStateChange
     */
    stop () {
        if (this.get("postRenderHandler")) {
            this.get("postRenderHandler")();
            this.setPostRenderHandler(null);
        }

        if (this.get("screenSpaceCameraController")) {
            this.get("screenSpaceCameraController").enableInputs = true;
        }

        this.setPlaying(false);
        this.setPaused(false);

        this.setCurrentTime(0);
        this.setCurrentSystemTime(null);
        Radio.trigger("FlightPlayer", "stateChange", "stop", this.get("activeInstance"));
    },

    /**
     * @param {Cesium.Scene} scene -
     * @return {void} -
     * @private
     */
    cesiumPostRender (scene) {
        const time = Date.now() / 1000;
        let seconds = "",
            view = {};

        if (!this.get("currentSystemTime")) {
            this.setCurrentSystemTime(time);
        }

        seconds = time - this.get("currentSystemTime");

        this.setCurrentSystemTime(time);
        if (this.get("paused")) {
            if (this.get("screenSpaceCameraController")) {
                this.get("screenSpaceCameraController").enableInputs = true;
            }
            return;
        }

        this.setCurrentTime(this.get("currentTime") + seconds * this.get("multiplier"));
        if (this.get("currentTime") > this.get("endTime")) {
            if (this.get("repeat")) {
                this.setCurrentTime(this.get("currentTime") - this.get("endTime"));
            }
            else {
                this.stop();
                return;
            }
        }
        else if (this.get("currentTime") < this.get("startTime")) {
            if (this.get("repeat")) {
                this.setCurrentTime(this.get("endTime") + this.get("currentTime"));
            }
            else {
                this.setCurrentTime(this.get("startTime"));
                return;
            }
        }

        view = {
            destination: this.get("destinationSpline").evaluate(this.get("currentTime")),
            orientation: Cesium.HeadingPitchRoll.fromQuaternion(this.get("quaternionSpline").evaluate(this.get("currentTime")))
        };

        scene.camera.setView(view);
        if (this.get("screenSpaceCameraController")) {
            this.get("screenSpaceCameraController").enableInputs = false;
        }
    },

    /**
     * @private
     * @return {void} -
     */
    updateSplines () {
        const viewpoints = this.get("activeInstance").get("viewpoints"),
            loop = this.get("activeInstance").get("loop"),
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

        this.setDestinationSpline(this.get("activeInstance").get("interpolation") === "spline" ? new Cesium.CatmullRomSpline({times, points}) : new Cesium.LinearSpline({times, points}));
        this.setQuaternionSpline(new Cesium.QuaternionSpline({times, points: quaternions}));

        this.setEndTime(times[length - 1]);
        this.setTimes(times);
        this.setRepeat(loop);
    },

    setDestinationSpline: function (value) {
        this.set("destinationSpline", value);
    },

    setQuaternionSpline: function (value) {
        this.set("quaternionSpline", value);
    },

    setPlaying: function (value) {
        this.set("playing", value);
    },

    setPaused: function (value) {
        this.set("paused", value);
    },

    setActiveInstance: function (value) {
        this.set("activeInstance", value);
    },

    setRepeat: function (value) {
        this.set("repeat", value);
    },

    setEndTime: function (value) {
        this.set("endTime", value);
    },

    setCurrentTime: function (value) {
        this.set("currentTime", value);
    },

    setTimes: function (value) {
        this.set("times", value);
    },

    setCurrentSystemTime: function (value) {
        this.set("currentSystemTime", value);
    },

    setPostRenderHandler: function (value) {
        this.set("postRenderHandler", value);
    },

    setScreenSpaceCameraController: function (value) {
        this.set("screenSpaceCameraController", value);
    }

});

/**
 * only exported for testing purposes, use getInstance
 */
export default FlightPlayer;

let instance;

/**
 * returns the singleton flightPlayerInstance
 * @return {FlightPlayer} -
 * @memberof Tools.VirtualCity
 */
export function getInstance () {
    if (!instance) {
        instance = new FlightPlayer();
    }
    return instance;
}
