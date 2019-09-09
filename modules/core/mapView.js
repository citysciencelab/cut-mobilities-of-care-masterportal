import {Projection, addProjection} from "ol/proj.js";
import View from "ol/View.js";

const MapView = Backbone.Model.extend(/** @lends MapView.prototype */{
    defaults: {
        epsg: "EPSG:25832",
        background: "",
        backgroundImage: "",
        extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
        options: [
            {
                resolution: 66.14579761460263,
                scale: 250000,
                zoomLevel: 0
            },
            {
                resolution: 26.458319045841044,
                scale: 100000,
                zoomLevel: 1
            },
            {
                resolution: 15.874991427504629,
                scale: 60000,
                zoomLevel: 2
            },
            {
                resolution: 10.583327618336419,
                scale: 40000,
                zoomLevel: 3
            },
            {
                resolution: 5.2916638091682096,
                scale: 20000,
                zoomLevel: 4
            },
            {
                resolution: 2.6458319045841048,
                scale: 10000,
                zoomLevel: 5
            },
            {
                resolution: 1.3229159522920524,
                scale: 5000,
                zoomLevel: 6
            },
            {
                resolution: 0.6614579761460262,
                scale: 2500,
                zoomLevel: 7
            },
            {
                resolution: 0.2645831904584105,
                scale: 1000,
                zoomLevel: 8
            },
            {
                resolution: 0.13229159522920521,
                scale: 500,
                zoomLevel: 9
            }
        ],
        resolution: 15.874991427504629,
        startCenter: [565874, 5934140],
        units: "m",
        DOTS_PER_INCH: $("#dpidiv").outerWidth() // Hack um die Bildschirmauflösung zu bekommen
    },

    /**
     * @class MapView
     * @description todo
     * @extends Backbone.Model
     * @memberOf Core.ModelList
     * @constructs
     *
     * @param {object} attributes Class attributes
     *
     * @listensMapView#RadioRequestMapViewGetCenter
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

     * @fires CRS#RadioRequestCRSGetProjection
     * @fires CRS#RadioRequestCRSTransformToMapProjection
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

        channel.reply({
            "getProjection": function () {
                return this.get("projection");
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
                return this.get("resolutions");
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

        // overwrite the resolution if zoomLevel is configured and resolution is not
        if (attributes && _.isUndefined(attributes.resolution) && Number.isInteger(attributes.zoomLevel)) {

            const resolution = this.get("options")[attributes.zoomLevel].resolution;

            this.setResolution(resolution);
        }
        this.setResolutions();
        this.setProjection();
        this.setProjectionFromParamUrl(Radio.request("ParametricURL", "getProjectionFromUrl"));
        this.prepareStartCenter(Radio.request("ParametricURL", "getCenter"));
        this.setStartZoomLevel(Radio.request("ParametricURL", "getZoomLevel"));
        this.prepareView();

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
        this.get("view").setCenter(this.get("startCenter"));
        this.get("view").setResolution(this.get("resolution"));
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
                startCenter = Radio.request("CRS", "transformToMapProjection", this.get("projectionFromParamUrl"), startCenter);
            }
            this.setStartCenter(startCenter);
        }
    },

    /**
     * @description todo
     * @param  {int} value Zoom Level
     * @return {void}
     */
    setStartZoomLevel: function (value) {
        if (!_.isUndefined(value)) {
            this.set("resolution", this.get("resolutions")[value]);
        }
    },

    /**
     * @description todo
     * @param  {int} value Resolution
     * @return {void}
     */
    setResolution: function (value) {
        this.set("resolution", value);
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
     * @return {void}
     */
    setResolutions: function () {
        this.set("resolutions", _.pluck(this.get("options"), "resolution"));
    },

    /**
     * @description Setzt die ol Projektion anhand des epsg-Codes
     *
     * @fires Alert#RadioTriggerAlertAlert
     *
     * @returns {void}
     */
    setProjection: function () {
        var epsgCode = this.get("epsg"),
            proj = Radio.request("CRS", "getProjection", epsgCode);

        if (!proj) {
            Radio.trigger("Alert", "alert", "Unknown CRS " + epsgCode + ". Can't set projection.");
            return;
        }

        proj = new Projection({
            code: epsgCode,
            units: this.get("units"),
            extent: this.get("extent"),
            axisOrientation: "enu",
            global: false
        });

        addProjection(proj);

        // attach epsg and projection object to Config.view for further access by other modules
        Config.view = {
            epsg: proj.getCode(),
            proj: proj
        };

        this.set("projection", proj);
        Radio.trigger("CRS", "addAliasForWFSFromGoeserver", epsgCode);
    },

    /**
     * @description todo
     * @return {void}
     */
    prepareView: function () {
        this.setView(new View({
            projection: this.get("projection"),
            center: this.get("startCenter"),
            extent: this.get("extent"),
            resolution: this.get("resolution"),
            resolutions: this.get("resolutions")
        }));
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
            return this.get("resolutions")[index];
        }
        else if (scaleType === "min") {
            return this.get("resolutions")[index - 1];
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
    },

    /**
     * @description Sets start center
     * @param {boolean} value todo
     * @return {float} current Zoom of MapView
     */
    setStartCenter: function (value) {
        this.set("startCenter", value);
    }
});

export default MapView;
