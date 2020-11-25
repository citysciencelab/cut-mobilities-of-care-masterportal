import {Projection} from "ol/proj.js";
import defaults from "masterportalAPI/src/defaults";
import {transformToMapProjection} from "masterportalAPI/src/crs";
import store from "../../src/app-store";

const MapView = Backbone.Model.extend(/** @lends MapView.prototype */{
    defaults: {
        background: "",
        units: "m",
        DOTS_PER_INCH: store.getters.dpi
    },

    /**
     * @class MapView
     * @description todo
     * @extends Backbone.Model
     * @memberof Core
     * @constructs
     * @property {String} background="" todo
     * @property {String} units="m" todo
     * @property {number} DOTS_PER_INCH="" Hack to get the screen resolution
     * @listens Core#RadioRequestMapViewGetCurrentExtent
     * @listens Core#RadioRequestMapViewGetOptions
     * @listens Core#RadioRequestMapViewGetProjection
     * @listens Core#RadioRequestMapViewGetResoByScale
     * @listens Core#RadioRequestMapViewGetScales
     * @listens Core#RadioRequestMapViewGetZoomLevel
     * @listens Core#RadioRequestMapViewGetResolutions
     * @listens Core#RadioTriggerMapViewResetView
     * @listens Core#RadioTriggerMapViewSetCenter
     * @listens Core#RadioTriggerMapViewSetConstrainedResolution
     * @listens Core#RadioTriggerMapViewSetScale
     * @listens Core#RadioTriggerMapViewSetZoomLevelDown
     * @listens Core#RadioTriggerMapViewSetZoomLevelUp
     * @listens Core#RadioTriggerMapViewToggleBackground
     * @fires Core#RadioRequestMapGetSize
     * @fires Core#RadioRequestParametricURLGetCenter
     * @fires Core#RadioRequestParametricURLGetProjectionFromUrl
     * @fires Core#RadioRequestParametricURLGetZoomLevel
     * @fires ClickCounter#RadioTriggerClickCounterZoomChanged
     * @fires Core#RadioTriggerMapViewChangedCenter
     * @fires Core#RadioTriggerMapViewChangedOptions
     * @fires Core#RadioTriggerMapViewChangedZoomLevel
     * @fires RemoteInterface#RadioTriggerRemoteInterfacePostMessage
     * @fires Core#RadioRequestMapGetMap
     * @returns {void}
     */
    initialize: function () {
        const channel = Radio.channel("MapView");

        if (this.get("settings") !== undefined && this.get("settings").options !== undefined) {
            this.setOptions(this.get("settings").options);
        }
        else {
            this.setOptions(defaults.options);
        }

        channel.reply({
            "getProjection": function () {
                return this.get("view").getProjection();
            },
            "getOptions": function () {
                return Radio.request("Util", "findWhereJs", this.get("options"), {resolution: this.get("view").getConstrainedResolution(this.get("view").getResolution())});
            },
            "getCenter": function () {
                return this.getCenter();
            },
            "getZoomLevel": function () {
                return this.getZoom();
            },
            "getResolutions": function () {
                return this.get("view").getResolutions();
            },
            "getResoByScale": this.getResoByScale,
            "getScales": function () {
                return this.get("options").map(function (option) {
                    return option.scale;
                });
            },
            "getCurrentExtent": this.getCurrentExtent,
            "getBackgroundImage": function () {
                return this.get("backgroundImage");
            }
        }, this);

        channel.on({
            "resetView": this.resetView,
            "setCenter": this.setCenter,
            "setConstrainedResolution": this.setConstrainedResolution,
            "setScale": this.setResolutionByScale,
            "setZoomLevelDown": this.setZoomLevelDown,
            "setZoomLevelUp": this.setZoomLevelUp,
            "toggleBackground": this.toggleBackground
        }, this);

        if (document.getElementById("map") !== null) {
            this.setBackgroundImage(document.getElementById("map").style.backgroundImage);
        }
        this.setProjectionFromParamUrl(Radio.request("ParametricURL", "getProjectionFromUrl"));
        this.prepareStartCenter(Radio.request("ParametricURL", "getCenter"));
        this.setStartZoomLevel(Radio.request("ParametricURL", "getZoomLevel"));

        // Listener für ol.View
        this.get("view").on("change:resolution", this.changedResolutionCallback.bind(this), this);
        this.get("view").on("change:center", function () {
            Radio.trigger("MapView", "changedCenter", this.getCenter());
            Radio.trigger("RemoteInterface", "postMessage", {"centerPosition": this.getCenter()});
        }, this);
        Radio.trigger("MapView", "changedOptions", Radio.request("Util", "findWhereJs", this.get("options"), {resolution: this.get("view").getConstrainedResolution(this.get("view").getResolution())}));
        // NOTE: used for scaleSwitcher-tutorial
        store.commit("Map/setScales", {scales: this.get("options").map(function (option) {
            return option.scale;
        })});
    },

    /**
     * @description is called when the view resolution is changed triggers the map view options
     * @param {ObjectEvent} evt - openlayers event object
     * @param {string} evt.key - the name of the property whose value is changing
     * @param {ol.View} evt.target - this.get("view")
     * @fires Core#RadioTriggerMapViewChangedOptions
     * @fires Core#RadioTriggerMapViewChangedZoomLevel
     * @fires ClickCounter#RadioTriggerClickCounterZoomChanged
     * @fires RemoteInterface#RadioTriggerRemoteInterfacePostMessage
     * @returns {void}
     */
    changedResolutionCallback: function (evt) {
        const mapView = evt.target,
            constrainResolution = mapView.getConstrainedResolution(mapView.get(evt.key)),
            params = Radio.request("Util", "findWhereJs", this.get("options"), {resolution: constrainResolution});

        Radio.trigger("MapView", "changedOptions", params);
        Radio.trigger("MapView", "changedZoomLevel", this.getZoom());
        Radio.trigger("ClickCounter", "zoomChanged");
        Radio.trigger("RemoteInterface", "postMessage", {"zoomLevel": this.getZoom()});
    },

    /**
     * @description finds the right resolution for the scale and sets it for this view
     * @param {number} scale - map view scale
     * @returns {void}
     */
    setResolutionByScale: function (scale) {
        const params = Radio.request("Util", "findWhereJs", this.get("options"), {scale: scale});

        if (this.get("view") !== undefined) {
            this.get("view").setResolution(params.resolution);
        }
    },

    /**
     * @description todo
     * @param {number} resolution -
     * @returns {void}
     */
    setConstrainedResolution: function (resolution) {
        this.get("view").setResolution(resolution);
    },

    /**
     * Sets center and resolution to initial values
     * @fires Core#RadioRequestParametricURLGetCenter
     * @returns {void}
     */
    resetView: function () {
        const paramUrlCenter = Radio.request("ParametricURL", "getCenter"),
            settingsCenter = this.get("settings") !== undefined && this.get("settings").hasOwnProperty("startCenter") ? this.get("settings").startCenter : undefined,
            defaultCenter = defaults.startCenter,
            center = paramUrlCenter || settingsCenter || defaultCenter,
            settingsResolution = this.get("settings") !== undefined && this.get("settings").hasOwnProperty("resolution") ? this.get("settings").resolution : undefined,
            defaultResolution = defaults.startResolution,
            resolution = settingsResolution || defaultResolution;

        this.get("view").setCenter(center);
        this.get("view").setResolution(resolution);
        store.dispatch("MapMarker/removePointMarker");
    },

    /**
     * Sets the Background for the Mapview.
     * @param  {string} value Image Url
     * @returns {void}
     */
    setBackground: function (value) {
        this.set("background", value);
    },

    /**
     * Sets the Backgroundimage for the Mapview.
     * @param  {string} value BG Image Url
     * @returns {void}
     */
    setBackgroundImage: function (value) {
        this.set("backgroundImage", value);
    },

    /**
     * @description todo
     * @param {int} value todo
     * @fires Core#RadioRequestMapGetMap
     * @returns {void}
     */
    prepareStartCenter: function (value) {
        let startCenter = value;

        if (startCenter !== undefined) {
            if (this.get("projectionFromParamUrl") !== undefined) {
                startCenter = transformToMapProjection(Radio.request("Map", "getMap"), this.get("projectionFromParamUrl"), startCenter);
            }
            this.get("view").setCenter(startCenter);
        }
    },

    /**
     * @description todo
     * @param  {number} value Zoom Level
     * @returns {void}
     */
    setStartZoomLevel: function (value) {
        if (value !== undefined) {
            this.get("view").setResolution(this.get("view").getResolutions()[value]);
        }
    },

    /**
     * @description todo
     * @returns {void}
     */
    toggleBackground: function () {
        if (this.get("background") === "white") {
            this.setBackground(this.get("backgroundImage"));
            $("#map").css("background", this.get("backgroundImage") + "repeat scroll 0 0 rgba(0, 0, 0, 0)");
        }
        else {
            this.setBackground("white");
            $("#map").css("background", "white");
        }
    },

    /**
     * Sets the view.
     * @param {object} view todo
     * @return {void}
     */
    setView: function (view) {
        this.set("view", view);
    },

    /**
     * @description todo
     * @param  {array} coords Coordinates
     * @param  {number} zoomLevel Zoom Level
     * @return {void}
     */
    setCenter: function (coords, zoomLevel) {
        let first2Coords = [coords[0], coords[1]];

        // Coordinates need to be integers, otherwise open layers will go nuts when you attempt to pan the
        // map. Please fix this at the origin of those stringified numbers. However, this is to adress
        // possible future issues:
        if (typeof first2Coords[0] !== "number" || typeof first2Coords[1] !== "number") {
            console.warn("Given coordinates must be of type integer! Although it might not break, something went wrong and needs to be checked!");
            first2Coords = first2Coords.map(singleCoord => parseInt(singleCoord, 10));
        }

        this.get("view").setCenter(first2Coords);

        if (zoomLevel !== undefined) {
            this.get("view").setZoom(zoomLevel);
        }
    },

    /**
     * Increases the zoomlevel by one.
     * @return {void}
     */
    setZoomLevelUp: function () {
        this.get("view").setZoom(this.getZoom() + 1);
    },

    /**
     * Reduces the zoomlevel by one.
     * @return {void}
     */
    setZoomLevelDown: function () {
        this.get("view").setZoom(this.getZoom() - 1);
    },

    /**
     * Returns the corresponding resolution for the scale.
     * @param  {String|number} scale - todo
     * @param  {String} scaleType - min or max
     * @return {number} resolution
     */
    getResoByScale: function (scale, scaleType) {
        const scales = this.get("options").map(function (option) {
            return option.scale;
        });

        let index = "",
            unionScales = scales.concat([parseInt(scale, 10)].filter(item => scales.indexOf(item) < 0));

        unionScales = unionScales.sort(function (a, b) {
            return b - a;
        });

        index = unionScales.indexOf(parseInt(scale, 10));
        if (unionScales.length === scales.length || scaleType === "max") {
            return this.get("view").getResolutions()[index];
        }
        else if (scaleType === "min") {
            return this.get("view").getResolutions()[index - 1];
        }
        return null;
    },

    /**
     * @description gets the center from the mapView
     * @return {array} Center Coords
     */
    getCenter: function () {
        return this.get("view").getCenter();
    },

    /**
     * @description todo
     * @param {float} scale todo
     * @return {float} Resolution
     */
    getResolution: function (scale) {
        const units = this.get("units"),
            mpu = Projection.METERS_PER_UNIT[units],
            dpi = this.get("DOTS_PER_INCH"),
            resolution = scale / (mpu * 39.37 * dpi);

        return resolution;
    },

    /**
     * @description Return current Zoom of MapView
     * @return {number} current Zoom of MapView
     */
    getZoom: function () {
        return this.get("view").getZoom();
    },

    /**
     * calculate the extent for the current view state and the passed size
     * @fires Core#RadioRequestMapGetSize
     * @return {ol.extent} extent
     */
    getCurrentExtent: function () {
        const mapSize = Radio.request("Map", "getSize");

        return this.get("view").calculateExtent(mapSize);
    },

    /**
     * @description Sets projection from param url
     * @param {string} projection todo
     * @returns {void}
     */
    setProjectionFromParamUrl: function (projection) {
        this.set("projectionFromParamUrl", projection);
    },

    /**
     * @description Sets projection from param url
     * @param {Object} value options from mapView
     * @returns {void}
     */
    setOptions: function (value) {
        this.set("options", value);
    }
});

export default MapView;
