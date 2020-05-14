<script>
import {OverviewMap} from "ol/control.js";
import {mapGetters} from "vuex";
import {getOverviewMapLayer, getOverviewMapView} from "./utils";
import ControlIcon from "../../ControlIcon.vue";

/**
 * Overview control that shows a mini-map to support a user's
 * sense of orientation within the map.
 */
export default {
    name: "OverviewMap",
    components: {
        ControlIcon
    },
    props: {
        /** @deprecated resolution of mini-map view */
        resolution: {
            type: Number,
            required: false,
            default: null
        },
        /** @deprecated id of layer to show in mini-map */
        baselayer: {
            type: String,
            required: false,
            default: null
        },
        /** id of layer to show in mini-map */
        layerId: {
            type: String,
            required: false,
            default: null
        },
        /** whether the mini-map is visible initially */
        isInitOpen: {
            type: Boolean,
            default: true
        }
    },
    data: function () {
        return {
            supportedIn3d: false, // TODO not used yet, figure out how to use this
            open: this.isInitOpen,
            overviewMap: null
        };
    },
    computed: {
        ...mapGetters("Map", ["map"])
    },
    created () {
        // deprecation warnings
        if (this.baselayer !== null) {
            console.warn("Using 'baselayer' in 'overviewMap'. Please note this is deprecated. Use 'layerId' instead.");
        }

        if (this.resolution !== null) {
            console.warn("Using 'resolution' in 'overviewMap'. Please note this is deprecated.");
        }
    },
    mounted () {
        const id = this.layerId || this.baselayer,
            layer = getOverviewMapLayer(id),
            view = getOverviewMapView(this.map, this.resolution);

        if (layer) {
            this.overviewMap = new OverviewMap({
                layers: [layer],
                view,
                collapsible: false,
                // OverviewMap can only be produced in "mounted" when "target" is available already
                target: "overviewmap-wrapper"
            });
        }

        // if initially open, add control now that available
        if (this.open && this.overviewMap !== null) {
            this.map.addControl(this.overviewMap);
        }
    },
    methods: {
        /**
         * Toggles the visibility of the mini-map.
         * @returns {void}
         */
        toggleOverviewMapFlyout () {
            this.open = !this.open;
            if (this.overviewMap !== null) {
                this.map[`${this.open ? "add" : "remove"}Control`](this.overviewMap);
            }
        }
    }
};
</script>

<template>
    <div id="overviewmap-wrapper">
        <ControlIcon
            class="overviewmap-button"
            :title="$t(`common:modules.controls.overviewMap.${open ? 'hide' : 'show'}OverviewControl`)"
            icon-name="globe"
            :on-click="toggleOverviewMapFlyout"
        />
    </div>
    <!-- TODO Table Mode
        <div id="mini-map" class="table-tool">
            <a href="#">
                <span class="glyphicon glyphicon-globe"></span>
                <span id="mini-map_title"><% if(isInitOpen === true) {print (hideOverviewTableText);} else {print (showOverviewTableText);} %></span>
            </a>
        </div>

        "showOverviewTable": "Mini-Map einschalten",
        "hideOverviewTable": "Mini-Map ausschalten"
    -->
</template>

<style lang="less">
    /* ⚠️ unscoped css, extend with care;
     * control (.ol-overviewmap) is out of scope;
     * overriding with global rule that avoids leaks
     * by using local id #overviewmap-wrapper */

    @import "../../../../variables.less";
    @box-shadow: 0 6px 12px @shadow;

    #overviewmap-wrapper {
        position: relative;

        .ol-overviewmap {
            left: auto;
            right: 100%;
            box-shadow: @box-shadow;
            border: 0px;

            .ol-overviewmap-box {
                border: 2px solid @primary;
            }

            .ol-overviewmap-map {
                box-shadow: @box-shadow;
                width: 200px;
            }
        }
    }
</style>
