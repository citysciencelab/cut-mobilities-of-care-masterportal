import Tool from "../../core/modelList/tool/model";
import {Pointer} from "ol/interaction.js";
import {toStringHDMS, toStringXY} from "ol/coordinate.js";
import {getProjections, transformFromMapProjection} from "masterportalAPI/src/crs";


const CoordPopup = Tool.extend(/** @lends CoordPopup.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectPointerMove: null,
        projections: [],
        mapProjection: null,
        positionMapProjection: [],
        updatePosition: true,
        currentProjectionName: "EPSG:25832",
        deactivateGFI: true,
        renderToWindow: true,
        glyphicon: "glyphicon-screenshot",
        // translations
        coordSystemField: "",
        hdmsEastingLabel: "",
        hdmsNorthingLabel: "",
        cartesianEastingLabel: "",
        cartesianNorthingLabel: ""
    }),

    /**
     * @class CoordPopup
     * @extends Tool
     * @memberof Tools.GetCoord
     * @property {*} selectPointerMove=null todo
     * @property {array} projections=[] todo
     * @property {*} mapProjection=null todo
     * @property {array} positionMapProjection=[] todo
     * @property {boolean} updatePosition=true todo
     * @property {string} currentProjectionName="EPSG:25832" todo
     * @property {boolean} deactivateGFI=true todo
     * @property {boolean} renderToWindow=true todo
     * @property {string} glyphicon="glyphicon-screenshot" todo
     * @property {String} coordSystemField="", filled with "Koordinatensystem"- translated
     * @property {String} hdmsEastingLabel="", filled with "Länge"- translated
     * @property {String} hdmsNorthingLabel="", filled with "Breite"- translated
     * @property {String} cartesianEastingLabel="", filled with "Rechtswert"- translated
     * @property {String} cartesianNorthingLabel="", filled with "Hochwert"- translated
     * @constructs
     * @listens Tools.GetCoord#RadioTriggerChangeIsActive
     * @listens i18next#RadioTriggerLanguageChanged
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @fires Core#RadioTriggerMapRegisterListener
     * @fires MapMarker#RadioTriggerMapMarkerShowMarker
     */
    initialize: function () {
        this.superInitialize();
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                Radio.trigger("MapMarker", "hideMarker");
                Radio.trigger("Map", "registerListener", "pointermove", this.setCoordinates.bind(this), this);
                if (value) {
                    this.listenTo(Radio.channel("Map"), {
                        "clickedWindowPosition": function (evt) {
                            this.positionClicked(evt.coordinate);
                        }
                    });
                }
                else {
                    this.stopListening(Radio.channel("Map", "clickedWindowPosition"));
                }
            }
        });

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang();
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void} -
     */
    changeLang: function () {
        this.set({
            "coordSystemField": i18next.t("common:modules.tools.getCoord.coordSystemField"),
            "hdmsEastingLabel": i18next.t("common:modules.tools.getCoord.hdms.eastingLabel"),
            "hdmsNorthingLabel": i18next.t("common:modules.tools.getCoord.hdms.northingLabel"),
            "cartesianEastingLabel": i18next.t("common:modules.tools.getCoord.cartesian.eastingLabel"),
            "cartesianNorthingLabel": i18next.t("common:modules.tools.getCoord.cartesian.northingLabel")
        });
    },

    /**
     * Stores the projections and adds interaction pointermove to map
     * @fires Core#RadioRequestMapViewGetProjection
     * @fires Core#RadioTriggerMapAddInteraction
     * @returns {void}
     */
    createInteraction: function () {
        this.setProjections(getProjections());
        this.setMapProjection(Radio.request("MapView", "getProjection"));
        this.setSelectPointerMove(new Pointer({
            handleMoveEvent: function (evt) {
                this.checkPosition(evt.coordinate);
            }.bind(this),
            handleDownEvent: function (evt) {
                this.positionClicked(evt.coordinate);
            }.bind(this)
        }, this));

        Radio.trigger("Map", "addInteraction", this.get("selectPointerMove"));
    },

    removeInteraction: function () {
        Radio.trigger("Map", "removeInteraction", this.get("selectPointerMove"));
        this.set("selectPointerMove", null);
    },

    checkPosition: function (position) {
        if (this.get("updatePosition")) {
            Radio.trigger("MapMarker", "showMarker", position);
            this.setPositionMapProjection(position);
        }
    },

    /**
     * Remembers the projection and shows mapmarker at the given position.
     * @param {*} position - todo
     * @fires MapMarker#RadioTriggerMapMarkerShowMarker
     * @returns {*} todo
     */
    positionClicked: function (position) {
        var isViewMobile = Radio.request("Util", "isViewMobile"),
            updatePosition = isViewMobile ? true : this.get("updatePosition");

        this.setPositionMapProjection(position);
        this.setUpdatePosition(!updatePosition);
        Radio.trigger("MapMarker", "showMarker", position);
    },

    /**
     * todo
     * @param {*} targetProjection - todo
     * @returns {*} todo
     */
    returnTransformedPosition: function (targetProjection) {
        var positionMapProjection = this.get("positionMapProjection"),
            positionTargetProjection = [0, 0];

        if (positionMapProjection.length > 0) {
            positionTargetProjection = transformFromMapProjection(Radio.request("Map", "getMap"), targetProjection, positionMapProjection);
        }

        return positionTargetProjection;
    },

    /**
     * todo
     * @param {*} name - todo
     * @returns {*} todo
     */
    returnProjectionByName: function (name) {
        var projections = this.get("projections");

        return _.find(projections, function (projection) {
            return projection.name === name;
        });
    },

    /**
     * todo
     * @param {*} coord - todo
     * @returns {*} todo
     */
    getHDMS: function (coord) {
        return toStringHDMS(coord);
    },

    /**
     * Getter for cartesian coordinates.
     * @param {*} coord - todo
     * @returns {string} cartesian coordinates
     */
    getCartesian: function (coord) {
        return toStringXY(coord, 2);
    },

    /**
     * Setter for selectPointerMove.
     * @param {*} value - todo
     * @returns {void}
     */
    setSelectPointerMove: function (value) {
        this.set("selectPointerMove", value);
    },

    /**
     * Setter for mapProjection.
     * @param {*} value - todo
     * @returns {void}
     */
    setMapProjection: function (value) {
        this.set("mapProjection", value);
    },

    /**
     * Setter for projections.
     * @param {*} value - todo
     * @returns {void}
     */
    setProjections: function (value) {
        this.set("projections", value);
    },

    /**
     * Setter for positionMapProjection.
     * @param {*} value - todo
     * @returns {void}
     */
    setPositionMapProjection: function (value) {
        this.set("positionMapProjection", value);
    },

    /**
     * Setter for updatePosition.
     * @param {*} value - todo
     * @returns {void}
     */
    setUpdatePosition: function (value) {
        this.set("updatePosition", value);
    },

    /**
     * Setter for currentProjectionName.
     * @param {*} value - todo
     * @returns {void}
     */
    setCurrentProjectionName: function (value) {
        this.set("currentProjectionName", value);
    },

    /**
     * Setter for coordinates.
     * @param {*} evt - todo
     * @returns {void}
     */
    setCoordinates: function (evt) {
        var position = evt.coordinate;

        if (this.get("updatePosition")) {
            this.setPositionMapProjection(position);
        }
    }
});

export default CoordPopup;
