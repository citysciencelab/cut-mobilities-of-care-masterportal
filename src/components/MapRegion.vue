<script>
import Alerting from "./Alerting.vue";
import SupplyCoord from "./SupplyCoord.vue";
import Controls from "./controls/Controls.vue";
import Footer from "./Footer.vue";

export default {
    name: "MapRegion",
    components: {
        Controls,
        Alerting,
        SupplyCoord,
        Footer
    }
};
</script>

<template>
    <div class="anchor">
        <div id="map" />
        <div class="elements-positioned-over-map">
            <Controls class="controls" />
            <Footer />
        </div>
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
