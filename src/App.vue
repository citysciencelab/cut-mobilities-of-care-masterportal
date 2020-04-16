<script>
import Alerting from "./modules/Alerting/components/Alerting.vue";
import SupplyCoord from "./components/SupplyCoord.vue";
import ScaleLine from "./modules/scaleLine/components/ScaleLine.vue";
import Controls from "./components/controls/Controls.vue";
// import Tools from "./components/tools/Tools.vue";
import Title from "./components/Title.vue";
import MapModuleDebug from "./store/modules/map/MapModuleDebug.vue";
import isDevMode from "./utils/isDevMode";
import Language from "./components/Language.vue";

export default {
    name: "App",
    components: {
        Controls,
        Alerting,
        Title,
        SupplyCoord,
        ScaleLine,
        // Tools,
        Language,
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
        <Language v-if="$i18n.i18next.options.isEnabled() && Object.keys($i18n.i18next.options.getLanguages()).length > 1" />
    </div>
</template>

<style>

</style>
