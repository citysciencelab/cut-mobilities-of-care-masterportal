<script>
import Alerting from "./components/Alerting.vue";
import SupplyCoord from "./components/SupplyCoord.vue";
import ScaleLine from "./components/ScaleLine.vue";
import Controls from "./components/controls/Controls.vue";
import Tools from "./components/tools/Tools.vue";
import Title from "./components/Title.vue";
import MapModuleDebug from "./store/modules/map/MapModuleDebug.vue";
import isDevMode from "./utils/isDevMode";

export default {
    name: "App",
    components: {
        Controls,
        Alerting,
        Title,
        SupplyCoord,
        ScaleLine,
        Tools,
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
        <!-- <Tools /> this is only a dataflow test, not real tools -->
        <MapModuleDebug v-if="isDevMode" />
        <Title />
    </div>
</template>

<style>

</style>
