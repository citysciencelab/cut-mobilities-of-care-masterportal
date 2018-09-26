define(function (require) {
    var Tool = require("modules/core/modelList/tool/model"),
        ol = require("openlayers"),
        CoordPopup;

    CoordPopup = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            selectPointerMove: null,
            projections: [],
            mapProjection: null,
            positionMapProjection: [],
            updatePosition: true,
            currentProjectionName: "EPSG:25832",
            deactivateGFI: true,
            renderToWindow: true
        }),
        initialize: function () {
            this.superInitialize();
            this.listenTo(this, {
                "change:isActive": function () {
                    Radio.trigger("MapMarker", "hideMarker");
                }
            });
        },

        createInteraction: function () {
            this.setProjections(Radio.request("CRS", "getProjections"));
            this.setMapProjection(Radio.request("MapView", "getProjection"));
            this.setSelectPointerMove(new ol.interaction.Pointer({
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
            if (this.get("updatePosition") === true) {
                this.setPositionMapProjection(position);
            }
        },

        positionClicked: function (position) {
            var updatePosition = this.get("updatePosition");

            this.setPositionMapProjection(position);
            this.setUpdatePosition(!updatePosition);
            this.toggleMapMarker(position, updatePosition);
        },

        /**
         * Shows the map marker when the coordinate is frozen.
         * Otherwise, the MapMarker hide
         * @param {array} position at which was clicked
         * @param {boolean} updatePosition display of the position is frozen
         * @returns {void}
         */
        toggleMapMarker: function (position, updatePosition) {
            var showHideMarker = updatePosition ? "showMarker" : "hideMarker";

            Radio.trigger("MapMarker", showHideMarker, position);
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
            return ol.coordinate.toStringHDMS(coord);
        },

        getCartesian: function (coord) {
            return ol.coordinate.toStringXY(coord, 2);
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

    return CoordPopup;
});
