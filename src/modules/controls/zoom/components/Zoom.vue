
<script>
import {mapGetters, mapActions} from "vuex";
import ControlIcon from "../../ControlIcon.vue";

export default {
    name: "Zoom",
    components: {
        ControlIcon
    },
    props: {},
    computed: {
        ...mapGetters(
            "Map",
            ["zoomLevel", "maximumZoomLevelActive", "minimumZoomLevelActive"]
        )
    },
    methods: {
        ...mapActions("Map", ["increaseZoomLevel", "decreaseZoomLevel"])
    }
};
</script>

<template>
    <div class="zoom-buttons">
        <ControlIcon
            icon-name="plus"
            title="Zoom In"
            :active="!maximumZoomLevelActive"
            :on-click="increaseZoomLevel"
        />
        <ControlIcon
            icon-name="minus"
            title="Zoom Out"
            :active="!minimumZoomLevelActive"
            :on-click="decreaseZoomLevel"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";
</style>
