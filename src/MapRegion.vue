<script>
import Alerting from "./modules/alerting/components/Alerting.vue";
import Draw from "./modules/tools/draw/components/Draw.vue";
import ScaleSwitcher from "./modules/tools/scale/components/ScaleSwitcher.vue";
import SupplyCoord from "./modules/tools/supplyCoord/components/SupplyCoord.vue";
import KmlImport from "./modules/tools/kmlImport/components/KmlImport.vue";
import ControlBar from "./modules/controls/ControlBar.vue";
import Footer from "./modules/footer/components/Footer.vue";
import {mapState} from "vuex";

export default {
    name: "MapRegion",
    components: {
        ControlBar,
        Alerting,
        Draw,
        ScaleSwitcher,
        SupplyCoord,
        KmlImport,
        Footer
    },
    computed: {
        ...mapState([
            // listen to configJson changes for mounting the tools
            "configJson",
            "i18NextInitialized"
        ])
    }
};
</script>

<template>
    <div class="anchor">
        <!-- OpenLayers node; control map itself via vuex map module -->
        <div
            id="map"
        />
        <!-- HUD elements; always present -->
        <div class="elements-positioned-over-map">
            <ControlBar class="controls" />
            <Footer />
        </div>
        <!-- elements that are somewhere above the map, but don't have a fixed position or are not always present -->
        <Alerting />
        <!-- Alternatively to adding the configJson lifecycle hook to every component, the Main component can wait mounting its children until the config is parsed -->
        <Draw v-if="configJson" />
        <ScaleSwitcher v-if="configJson" />
        <SupplyCoord v-if="configJson" />
        <KmlImport v-if="configJson" />
        <template v-if="i18NextInitialized">
            <component
                :is="$options.components[addonKey]"
                v-for="addonKey in $addons"
                :key="addonKey"
            />
        </template>
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
