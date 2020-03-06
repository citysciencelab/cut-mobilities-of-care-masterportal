<script>
import Alerting from "./components/Alerting.vue";
import SupplyCoord from "./components/SupplyCoord.vue";
import ScaleLine from "./components/ScaleLine.vue";
import Controls from "./components/controls/Controls.vue";

export default {
    name: "App",
    components: {
        Controls,
        Alerting,
        SupplyCoord,
        ScaleLine
    }
};
</script>

<template>
    <div id="app">
        <Alerting />
        <SupplyCoord />
        <ScaleLine />
        <Controls />
    </div>
</template>

<style>
</style>
