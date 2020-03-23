<script>
import Alerting from "./components/Alerting.vue";
import SupplyCoord from "./components/SupplyCoord.vue";
import ScaleLine from "./components/ScaleLine.vue";
import Controls from "./components/controls/Controls.vue";
import Title from "./components/Title.vue";
import Language from "./components/Language.vue";

export default {
    name: "App",
    components: {
        Controls,
        Alerting,
        Title,
        SupplyCoord,
        ScaleLine,
        Language
    }
};
</script>

<template>
    <div id="app">
        <Alerting />
        <SupplyCoord />
        <ScaleLine />
        <Controls />
        <Title />
        <Language />
    </div>
</template>

<style>

</style>
