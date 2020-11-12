<script>
import {mapGetters, mapActions} from "vuex";
import Overlay from "ol/Overlay.js";
import mapMarkerState from "../store/stateMapMarker.js";
import {Stroke, Fill} from "ol/style.js";

export default {
    name: "MapMarker",
    data: () => ({
        isActive: false,
        styleMapMarkerObject: {
            pinColor: "#E10019",
            fontSize: "38px",
            height: "auto",
            width: "auto",
            fillColorPolygon: [8, 119, 95, 0.3],
            strokeStylePolygon: {
                color: "#08775f",
                lineDash: [8],
                width: 4
            }
        }
    }),
    computed: {
        ...mapGetters("MapMarker", ["resultToMark", "wkt", "markerPolygon"]),
        ...mapGetters("Map", ["map"]),

        /**
         * Computed property to return the color of the mapMarker.
         * @returns {String} returns the color of the mapMarker.
         */
        mapMarkerStyle () {
            return this.getMapMarkerColor();
        }
    },
    watch: {
        /**
         * Watcher on the state, if coordinates are written into the state.
         * It's more or less the start of the mapMarker construction.
         * @param {Array} result - An array with the coordinate pair, which has to be marked.
         * @returns {void} returns nothing.
         */
        resultToMark (result) {
            if (!Array.isArray(result[0]) && result.length !== 0) {
                this.mapMarkerUnderConstruction(result);
            }
            else {
                this.mapMarkerUnderDeconstruction();
            }
        },
        wkt () {
            this.setMapMarkerPolygonStyle();
        }
    },
    mounted () {
        this.initialize();
    },
    methods: {
        ...mapActions("MapMarker", ["initialize", "placingPointMarker", "placingPolygonMarker"]),
        /**
         * Function to get the color. First checks, if the color is configured in the config.js resp. state.
         * Is this not the case the default color gets extracted from the data property.
         * @returns {String} returns the color of the mapMarker.
         */
        getMapMarkerColor: function () {
            this.styleMapMarkerObject.color = mapMarkerState.pinColor ? mapMarkerState.pinColor : this.styleMapMarkerObject.pinColor;
            return this.styleMapMarkerObject;
        },
        // TODO Beschreibung und ein einziges Styleobjekt mit setStyle hinzufügen!?
        setMapMarkerPolygonStyle: function () {
            const fillColorPolygon = mapMarkerState.fillColorPolygon ? mapMarkerState.fillColorPolygon : this.styleMapMarkerObject.fillColorPolygon,
                strokeStylePolygon = mapMarkerState.strokeStylePolygon ? mapMarkerState.strokeStylePolygon : this.styleMapMarkerObject.strokeStylePolygon,
                polygonStyleFill = new Fill({
                    color: fillColorPolygon
                }),
                polygonStyleStroke = new Stroke({
                    color: strokeStylePolygon.color,
                    lineDash: strokeStylePolygon.lineDash,
                    width: strokeStylePolygon.width
                });

            mapMarkerState.markerPolygon.style_.setFill(polygonStyleFill);
            mapMarkerState.markerPolygon.style_.setStroke(polygonStyleStroke);
        },

        /**
         * Function to construct the mapMarker. Therefore an overlay from openlayers is used.
         * The overlay consists of the element refMapMarker. refMapMarker is the div specified in the template section below.
         * After the overlay is completly constucted, it gets the position assigned, the variable "isActive" is set to true and
         * the overlay is added to the Map.
         * @param {Array} result - An array with the coordinate pair, which has to be marked.
         * @returns {void} returns nothing.
         */
        mapMarkerUnderConstruction: function (result) {
            const overlay = new Overlay({
                element: this.$refs.refMapMarker,
                positioning: "bottom-center",
                stopEvent: false
            });

            overlay.setPosition([result[0], result[1]]);
            this.isActive = true;
            this.map.addOverlay(overlay);
        },
        /**
         * Function to remove the MapMarker. The variable "isActive" is set so false.
         * The MapMarker is no longer visible. Also the overlay is removed from the map.
         * @returns {void} returns nothing.
         */
        mapMarkerUnderDeconstruction: function () {
            this.isActive = false;
            if (this.map) {
                this.map.removeOverlay(mapMarkerState.overlay);
            }
        }
    }
};

</script>

<template>
    <div ref="refMapMarker">
        <div
            v-if="isActive"
            id="mapMarker"
            :style="mapMarkerStyle"
            class="glyphicon glyphicon-map-marker"
        >
        </div>
    </div>
</template>

<style>
</style>
