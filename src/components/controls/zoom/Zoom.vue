
<script>
import {mapGetters, mapMutations} from "vuex";
import ControlIcon from "../ControlIcon.vue";

export default {
    name: "Zoom",
    components: {
        ControlIcon
    },
    props: {},
    computed: {
        ...mapGetters(
            "Map",
            ["map", "zoomLevel", "maxZoomLevel", "minZoomLevel"]
        ),
        isMax () {
            return this.zoomLevel === this.maxZoomLevel;
        },
        isMin () {
            return this.zoomLevel === this.minZoomLevel;
        }
    },
    methods: {
        ...mapMutations("Map", ["setZoomLevel"])
    }
};
</script>

<template>
    <div class="zoom-buttons">
        <ControlIcon
            icon-name="plus"
            title="Zoom In"
            :active="!isMax"
            @click.native="setZoomLevel(zoomLevel + 1)"
        />
        <ControlIcon
            icon-name="minus"
            title="Zoom Out"
            :active="!isMin"
            @click.native="setZoomLevel(zoomLevel - 1)"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "../../../variables.less";
</style>
