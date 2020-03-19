<script>
import Alerting from "./components/Alerting.vue";
import SupplyCoord from "./components/SupplyCoord.vue";
import ScaleLine from "./components/ScaleLine.vue";
import Controls from "./components/controls/Controls.vue";
import Tools from "./components/tools/Tools.vue";
import MapModuleDebug from "./store/modules/map/MapModuleDebug.vue";
import isDevMode from "./utils/isDevMode";

export default {
    name: "App",
    components: {
        Controls,
        Tools,
        Alerting,
        SupplyCoord,
        ScaleLine,
        MapModuleDebug
    },
    data: () => ({isDevMode})
};
</script>

<template>
    <div id="app">
        <Alerting />
        <SupplyCoord />
        <ScaleLine />
        <Controls />
        <Tools />
        <MapModuleDebug v-if="isDevMode" />
    </div>
</template>

<style>
</style>
