import {Projection} from "ol/proj.js";
import defaults from "masterportalAPI/src/defaults";
import {transformToMapProjection} from "masterportalAPI/src/crs";

const MapView = Backbone.Model.extend(/** @lends MapView.prototype */{
    defaults: {
        background: "",
        units: "m",
        DOTS_PER_INCH: $("#dpidiv").outerWidth() // Hack um die Bildschirmauflösung zu bekommen
    },

    /**
     * @class MapView
     * @description todo
     * @extends Backbone.Model
     * @memberOf Core.ModelList
     * @constructs
     * @param {object} attributes Class attributes
     * @listens MapView#RadioRequestMapViewGetCurrentExtent
     * @listens MapView#RadioRequestMapViewGetOptions
     * @listens MapView#RadioRequestMapViewGetProjection
     * @listens MapView#RadioRequestMapViewGetResoByScale
     * @listens MapView#RadioRequestMapViewGetScales
     * @listens MapView#RadioRequestMapViewGetZoomLevel
     * @listens MapView#RadioRequestMapViewGtResolutions
     * @listens MapView#RadioTriggerMapViewResetView
     * @listens MapView#RadioTriggerMapViewSetCenter
     * @listens MapView#RadioTriggerMapViewSetConstrainedResolution
     * @listens MapView#RadioTriggerMapViewSetScale
     * @listens MapView#RadioTriggerMapViewSetZoomLevelDown
     * @listens MapView#RadioTriggerMapViewSetZoomLevelUp
     * @listens MapView#RadioTriggerMapViewToggleBackground
     * @fires Map#RadioRequestMapGetSize
     * @fires ParametricURL#RadioRequestParametricURLgetCenter
     * @fires ParametricURL#RadioRequestParametricURLgetProjectionFromUrl
     * @fires ParametricURL#RadioRequestParametricURLgetZoomLevel
     * @fires Alert#RadioTriggerAlertAlert
     * @fires ClickCounter#RadioTriggerClickCounterZoomChanged
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @fires MapView#RadioTriggerMapViewChangedCenter
     * @fires MapView#RadioTriggerMapViewChangedOptions
     * @fires MapView#RadioTriggerMapViewChangedZoomLevel
     * @fires RemoteInterface#RadioTriggerRemoteInterfacePostMessage
     *
     * @returns {void}
     */
    initialize: function (attributes) {
        var channel = Radio.channel("MapView");

        if (!_.isUndefined(this.get("settings")) && !_.isUndefined(this.get("settings").options)) {
            this.set("options", this.get("settings").options);
        }
        else {
            this.set("options", defaults.options);
        }

        // overwrite the resolution if zoomLevel is configured and resolution is not
        if (attributes && attributes.resolution && attributes.zoomLevel !== undefined) {
            const resolution = this.get("options")[attributes.zoomLevel].resolution;

            this.get("settings").resolution = resolution;
            this.get("view").setResolution(resolution);
        }

        channel.reply({
            "getProjection": function () {
                return this.get("view").getProjection();
            },
            "getOptions": function () {
                return _.findWhere(this.get("options"), {resolution: this.get("view").constrainResolution(this.get("view").getResolution())});
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
                return _.pluck(this.get("options"), "scale");
            },
            "getCurrentExtent": this.getCurrentExtent
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

        this.listenTo(this, {
            "change:background": function (model, value) {
                if (value === "white") {
                    $("#map").css("background", "white");
                }
                else {
                    $("#map").css("background", "url('" + value + "') repeat scroll 0 0 rgba(0, 0, 0, 0)");
                }
            }
        });

        this.setProjectionFromParamUrl(Radio.request("ParametricURL", "getProjectionFromUrl"));
        this.prepareStartCenter(Radio.request("ParametricURL", "getCenter"));
        this.setStartZoomLevel(Radio.request("ParametricURL", "getZoomLevel"));

        // Listener für ol.View
        this.get("view").on("change:resolution", this.changedResolutionCallback.bind(this), this);
        this.get("view").on("change:center", function () {
            Radio.trigger("MapView", "changedCenter", this.getCenter());
            Radio.trigger("RemoteInterface", "postMessage", {"centerPosition": this.getCenter()});
        }, this);
    },

    /**
     * @description is called when the view resolution is changed triggers the map view options
     * @param {ObjectEvent} evt - openlayers event object
     * @param {string} evt.key - the name of the property whose value is changing
     * @param {ol.View} evt.target - this.get("view")
     *
     * @fires MapView#RadioTriggerMapViewChangedOptions
     * @fires MapView#RadioTriggerMapViewChangedZoomLevel
     * @fires ClickCounter#RadioTriggerClickCounterZoomChanged
     * @fires RemoteInterface#RadioTriggerRemoteInterfacePostMessage
     *
     * @returns {void}
     */
    changedResolutionCallback: function (evt) {
        var mapView = evt.target,
            constrainResolution = mapView.constrainResolution(mapView.get(evt.key)),
            params = _.findWhere(this.get("options"), {resolution: constrainResolution});

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
        var params = _.findWhere(this.get("options"), {scale: scale});

        if (!_.isUndefined(this.get("view"))) {
            this.get("view").setResolution(params.resolution);
        }
    },

    /**
     * @description todo
     * @param {number} resolution -
     * @param {number} direction - 0 set the nearest, 1 set the largest nearest, -1 set the smallest nearest
     * @returns {void}
     */
    setConstrainedResolution: function (resolution, direction) {
        this.get("view").setResolution(this.get("view").constrainResolution(resolution, 0, direction));
    },

    /**
     * @description todo
     *
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     *
     * @return {void}
     */
    resetView: function () {
        const center = Radio.request("ParametricURL", "getCenter") || this.get("settings").startCenter || defaults.options,
            resolution = this.get("settings").resolution || defaults.startResolution;

        this.get("view").setCenter(center);
        this.get("view").setResolution(resolution);
        Radio.trigger("MapMarker", "hideMarker");
    },

    /**
     * @description todo
     * @param  {string} value Image Url
     * @return {void}
     */
    setBackground: function (value) {
        this.set("background", value);
    },

    /**
     * @description todo
     * @param  {string} value BG Image Url
     * @return {void}
     */
    setBackgroundImage: function (value) {
        this.set("backgroundImage", value);
    },

    /**
     * @description todo
     * @param {int} value todo
     * @fires CRS#RadioRequestCRSTransformToMapProjection
     * @return {void}
     */
    prepareStartCenter: function (value) {
        var startCenter = value;

        if (!_.isUndefined(startCenter)) {
            if (!_.isUndefined(this.get("projectionFromParamUrl"))) {
                startCenter = transformToMapProjection(Radio.request("Map", "getMap"), this.get("projectionFromParamUrl"), startCenter);
            }
            this.get("view").setCenter(startCenter);
        }
    },

    /**
     * @description todo
     * @param  {int} value Zoom Level
     * @return {void}
     */
    setStartZoomLevel: function (value) {
        if (!_.isUndefined(value)) {
            this.get("view").setResolution(this.get("view").getResolutions()[value]);
        }
    },

    /**
     * @description todo
     * @return {void}
     */
    toggleBackground: function () {
        if (this.get("background") === "white") {
            this.setBackground(this.get("backgroundImage"));
        }
        else {
            this.setBackground("white");
        }
    },

    /**
     * @description todo
     * @param {object} view todo
     * @return {void}
     */
    setView: function (view) {
        this.set("view", view);
    },

    /**
     * @description todo
     * @param  {array} coords Coordinates
     * @param  {int} zoomLevel Zoom Level
     * @return {void}
     */
    setCenter: function (coords, zoomLevel) {
        var first2Coords = [coords[0], coords[1]];

        // Coordinates need to be integers, otherwise open layers will go nuts when you attempt to pan the
        // map. Please fix this at the origin of those stringified numbers. However, this is to adress
        // possible future issues:
        if (typeof first2Coords[0] !== "number" || typeof first2Coords[1] !== "number") {
            console.warn("Given coordinates must be of type integer! Although it might not break, something went wrong and needs to be checked!");
            first2Coords = first2Coords.map(singleCoord => parseInt(singleCoord, 10));
        }

        this.get("view").setCenter(first2Coords);

        if (!_.isUndefined(zoomLevel)) {
            this.get("view").setZoom(zoomLevel);
        }
    },

    /**
     * @description Todo
     * @return {void}
     */
    setZoomLevelUp: function () {
        this.get("view").setZoom(this.getZoom() + 1);
    },

    /**
     * @description Todo
     * @return {void}
     */
    setZoomLevelDown: function () {
        this.get("view").setZoom(this.getZoom() - 1);
    },

    /**
     * @description Gibt zur Scale die entsprechende Resolution zurück.
     * @param  {String|number} scale -
     * @param  {String} scaleType - min oder max
     * @return {number} resolution
     */
    getResoByScale: function (scale, scaleType) {
        var scales = _.pluck(this.get("options"), "scale"),
            unionScales = _.union(scales, [parseInt(scale, 10)]),
            index;

        unionScales = _.sortBy(unionScales, function (num) {
            return -num;
        });
        index = _.indexOf(unionScales, parseInt(scale, 10));
        if (unionScales.length === scales.length || scaleType === "max") {
            return this.get("view").getResolutions()[index];
        }
        else if (scaleType === "min") {
            return this.get("view").getResolutions()[index - 1];
        }
        return null;
    },

    /**
     * @description todo
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
        var units = this.get("units"),
            mpu = Projection.METERS_PER_UNIT[units],
            dpi = this.get("DOTS_PER_INCH"),
            resolution = scale / (mpu * 39.37 * dpi);

        return resolution;
    },

    /**
     * @description Return current Zoom of MapView
     * @return {float} current Zoom of MapView
     */
    getZoom: function () {
        return this.get("view").getZoom();
    },

    /**
     * calculate the extent for the current view state and the passed size
     * @return {ol.extent} extent
     */
    getCurrentExtent: function () {
        var mapSize = Radio.request("Map", "getSize");

        return this.get("view").calculateExtent(mapSize);
    },

    /**
     * @description Sets projection from param url
     * @param {string} projection todo
     * @return {float} current Zoom of MapView
     */
    setProjectionFromParamUrl: function (projection) {
        this.set("projectionFromParamUrl", projection);
    }
});

export default MapView;
