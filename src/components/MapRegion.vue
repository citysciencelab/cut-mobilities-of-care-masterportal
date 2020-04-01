<script>
import Alerting from "./Alerting.vue";
import SupplyCoord from "./SupplyCoord.vue";
import ControlBar from "./controls/ControlBar.vue";
import Footer from "./Footer.vue";

export default {
    name: "MapRegion",
    components: {
        ControlBar,
        Alerting,
        SupplyCoord,
        Footer
    }
};
</script>

<template>
    <div class="anchor">
        <!-- OpenLayers node; control map itself via vuex map module -->
        <div
            id="map"
            tabindex="0"
        />
        <!-- HUD elements; always present -->
        <div class="elements-positioned-over-map">
            <ControlBar class="controls" />
            <Footer />
        </div>
        <!-- elements that are somewhere above the map, but don't have a fixed position or are not always present -->
        <Alerting />
        <SupplyCoord />
    </div>
</template>

<style lang="less" scoped>
    .anchor {
        position: relative;

        /* map itself should fill the whole region as "background" */
        #map {
            position: absolute;
            height: 100%;
            width: 100%;
        }

        .elements-positioned-over-map {
            display: flex;
            flex-direction: column;
            align-items: end;

            height: 100%;
            width: 100%;

            .controls {
                flex-grow: 1;
            }
        }
    }
</style>
