<script>
import {mapGetters, mapActions} from "vuex";
import Overlay from "ol/Overlay.js";
import mapMarkerState from "../store/stateMapMarker.js";
import getters from "../store/gettersMapMarker";

export default {
    name: "MapMarker",
    data: () => ({
        isActive: false
    }),
    computed: {
        ...mapGetters("MapMarker", Object.keys(getters)),
        ...mapGetters("Map", ["map"]),

        /**
         * Computed property to return the color of the mapMarker.
         * @returns {String} returns the color of the mapMarker.
         */
        mapMarkerStyle () {
            return this.pinStyle;
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
        }
    },
    mounted () {
        this.initialize();
        this.setPolygonStyle();
    },
    methods: {
        ...mapActions("MapMarker", ["initialize", "setPolygonStyle"]),

        /**
         * Function to construct the mapMarker. Therefore an overlay from openlayers is used.
         * The overlay consists of the element refMapMarker. refMapMarker is the div specified in the template section below.
         * After the overlay is completly constucted, it gets the position assigned, the variable "isActive" is set to true and
         * the overlay is added to the Map.
         * @param {String[]} result - An array with the coordinate pair, which has to be marked.
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
