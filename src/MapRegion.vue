<script>
import Alerting from "./modules/alerting/components/Alerting.vue";
import SupplyCoord from "./modules/tools/supplyCoord/components/SupplyCoord.vue";
import ControlBar from "./modules/controls/ControlBar.vue";
import Footer from "./modules/footer/components/Footer.vue";

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
            align-items: flex-end;
            align-self: flex-end;

            height: 100%;
            width: 100%;

            .controls {
                flex-grow: 1;
            }
        }
    }
</style>
