<script>
import Alerting from "./components/Alerting.vue";
import SupplyCoord from "./components/SupplyCoord.vue";
import ScaleLine from "./components/ScaleLine.vue";

export default {
    name: "App",
    components: {
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
    </div>
</template>
<style>
</style>
