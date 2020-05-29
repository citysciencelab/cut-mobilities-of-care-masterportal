<script>
import {mapGetters} from "vuex";

export default {
    name: "ScaleLine",
    computed: {
        ...mapGetters("Map", ["scaleToOne", "scaleWithUnit", "mapMode"]),
        ...mapGetters(["mobile"]),
        showScale () {
            return !this.mobile && this.mapMode !== "Oblique";
        }
    }
};
</script>

<template>
    <div
        v-if="showScale"
        id="scales"
    >
        <span class="scale-line">
            {{ scaleWithUnit }}
        </span>
        <span class="scale-as-a-ratio">
            {{ scaleToOne }}
        </span>
    </div>
</template>

<style lang="less">
    @import "~variables";

    #scales {
        display: inline-block;
        color: @secondary_contrast;
        text-align: center;
        font-size: 10px;

        .scale-line {
            border-bottom: 1px solid;
            border-left: 1px solid;
            border-right: 1px solid;
            display: inline-block;
            width: 2cm;
        }

        .scale-as-a-ratio {
            padding: 0 16px;
        }
    }
</style>
