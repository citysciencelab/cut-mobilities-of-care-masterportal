
<script>
import {mapGetters, mapActions} from "vuex";

export default {
    name: "Zoom",
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
        ...mapActions("Map", ["setZoomLevel"])
    }
};
</script>

<template>
    <div class="zoom-buttons">
        <span
            :class="['glyphicon', 'glyphicon-plus', isMax ? 'inactive' : '']"
            title="Zoom In"
            @click="setZoomLevel(zoomLevel + 1)"
        />
        <span
            :class="['glyphicon', 'glyphicon-minus', isMin ? 'inactive' : '']"
            title="Zoom Out"
            @click="setZoomLevel(zoomLevel - 1)"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    .zoom-buttons {
        .glyphicon {
            font-size: 22px;
            margin-top: 4px;
        }
        .glyphicon-plus {
            display: block;
            padding: 5px 5px 6px 7px;
        }
        .glyphicon-minus {
            padding: 5px 7px 6px 5px;
        }
        .inactive {
            pointer-events: none;
            background-color: grey;
        }
    }
</style>
