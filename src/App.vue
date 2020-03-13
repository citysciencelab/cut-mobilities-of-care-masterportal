<script>
import Alerting from "./components/Alerting.vue";
import SupplyCoord from "./components/SupplyCoord.vue";
import ScaleLine from "./components/ScaleLine.vue";
import Controls from "./components/controls/Controls.vue";
import Tools from "./components/tools/Tools.vue";
import MapModuleTest from "./components/MapModuleTest.vue";

export default {
    name: "App",
    components: {
        Controls,
        Tools,
        Alerting,
        SupplyCoord,
        ScaleLine,
        MapModuleTest
    }
};
</script>

<template>
    <div id="app">
        <Alerting />
        <SupplyCoord />
        <ScaleLine />
        <Controls />
        <Tools />
        <MapModuleTest />
    </div>
</template>

<style>
</style>
