import Tool from "../../core/modelList/tool/model";
import {Pointer} from "ol/interaction.js";
import {toStringHDMS, toStringXY} from "ol/coordinate.js";


const CoordPopup = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectPointerMove: null,
        projections: [],
        mapProjection: null,
        positionMapProjection: [],
        updatePosition: true,
        currentProjectionName: "EPSG:25832",
        deactivateGFI: true,
        renderToWindow: true,
        glyphicon: "glyphicon-screenshot"
    }),

    initialize: function () {
        this.superInitialize();
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                Radio.trigger("MapMarker", "hideMarker");
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

    },

    createInteraction: function () {
        this.setProjections(Radio.request("CRS", "getProjections"));
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

    positionClicked: function (position) {
        var isViewMobile = Radio.request("Util", "isViewMobile"),
            updatePosition = isViewMobile ? true : this.get("updatePosition");

        this.setPositionMapProjection(position);
        this.setUpdatePosition(!updatePosition);
        Radio.trigger("MapMarker", "showMarker", position);
    },

    returnTransformedPosition: function (targetProjection) {
        var positionMapProjection = this.get("positionMapProjection"),
            positionTargetProjection = [0, 0];

        if (positionMapProjection.length > 0) {
            positionTargetProjection = Radio.request("CRS", "transformFromMapProjection", targetProjection, positionMapProjection);
        }

        return positionTargetProjection;
    },

    returnProjectionByName: function (name) {
        var projections = this.get("projections");

        return _.find(projections, function (projection) {
            return projection.name === name;
        });
    },

    getHDMS: function (coord) {
        return toStringHDMS(coord);
    },

    getCartesian: function (coord) {
        return toStringXY(coord, 2);
    },

    // setter for selectPointerMove
    setSelectPointerMove: function (value) {
        this.set("selectPointerMove", value);
    },

    // setter for mapProjection
    setMapProjection: function (value) {
        this.set("mapProjection", value);
    },

    // setter for projections
    setProjections: function (value) {
        this.set("projections", value);
    },

    // setter for positionMapProjection
    setPositionMapProjection: function (value) {
        this.set("positionMapProjection", value);
    },

    // setter for updatePosition
    setUpdatePosition: function (value) {
        this.set("updatePosition", value);
    },
    // setter for currentProjection
    setCurrentProjectionName: function (value) {
        this.set("currentProjectionName", value);
    }
});

export default CoordPopup;
