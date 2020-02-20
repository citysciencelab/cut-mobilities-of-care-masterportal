<script>
import Alerting from "./components/Alerting.vue";
import ScaleLine from "./components/ScaleLine.vue";

export default {
    name: "App",
    components: {
        Alerting,
        ScaleLine
    }
};
</script>

<template>
    <div id="app">
        <Alerting />
        <ScaleLine />
    </div>
</template>

<style>
</style>
