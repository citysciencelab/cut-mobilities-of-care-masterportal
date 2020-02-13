<script>
import Alerting from './components/Alerting.vue'
import Tool from './components/Tool.vue'
import SupplyCoord from './components/SupplyCoord.vue'
import ScaleLine from "./components/ScaleLine.vue";

export default {
  name: 'App',
  components: {
    Alerting,
    Tool,
    SupplyCoord,
    ScaleLine
  }
}
import Alerting from "./components/Alerting.vue";


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
        <SupplyCoord/>
        <ScaleLine />
    </div>
</template>

<style>
</style>
