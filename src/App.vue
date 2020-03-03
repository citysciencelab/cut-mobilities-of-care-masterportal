<script>
import Alerting from "./components/Alerting.vue";
import ScaleLine from "./components/ScaleLine.vue";
import SupplyCoord from "./components/SupplyCoord.vue";

export default {
    name: "App",
    components: {
        Alerting,
        ScaleLine,
        SupplyCoord
    }
};
</script>

<template>
    <div id="app">
        <Alerting />
        <ScaleLine />
        <SupplyCoord />
    </div>
</template>

<style>
</style>
