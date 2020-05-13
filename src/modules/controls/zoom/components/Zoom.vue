
<script>
import {mapGetters, mapActions} from "vuex";
import ControlIcon from "../../ControlIcon.vue";

/**
 * Zoom Component.
 * NOTE This should eventually listen to the VueX map module
 * as soon as 3D/OB mode are implemented in it. The flag
 * "mapMode" is already prepared in it, but not used yet.
 * @listens Map#RadioTriggerMapChange
 */
export default {
    name: "Zoom",
    components: {
        ControlIcon
    },
    props: {},
    data () {
        return {
            mapChannel: Radio.channel("Map"),
            visibleInMapMode: null // set in .created
        };
    },
    computed: {
        ...mapGetters(
            "Map",
            ["maximumZoomLevelActive", "minimumZoomLevelActive"]
        )
    },
    created () {
        this.checkModeVisibility();
        this.mapChannel.on("change", this.checkModeVisibility);
    },
    beforeDestroy () {
        this.mapChannel.off("change", this.checkModeVisibility);
    },
    methods: {
        ...mapActions("Map", ["increaseZoomLevel", "decreaseZoomLevel"]),
        checkModeVisibility () {
            this.visibleInMapMode = Radio.request("Map", "getMapMode") === "2D";
        }
    }
};
</script>

<template>
    <div
        v-if="visibleInMapMode"
        class="zoom-buttons"
    >
        <ControlIcon
            icon-name="plus"
            :title="$t(`common:modules.controls.zoom.zoomIn`)"
            :active="!maximumZoomLevelActive"
            :on-click="increaseZoomLevel"
        />
        <ControlIcon
            icon-name="minus"
            :title="$t(`common:modules.controls.zoom.zoomOut`)"
            :active="!minimumZoomLevelActive"
            :on-click="decreaseZoomLevel"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "../../../../variables.less";
</style>
