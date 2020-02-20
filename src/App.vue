<script>
import Alerting from './components/Alerting.vue'
import ScaleLine from "./components/ScaleLine.vue";
import Tool from './components/Tool.vue'
import SupplyCoord from './components/SupplyCoord.vue'

export default {
  name: 'app',
  components: {
    Alerting,
    ScaleLine,
    Tool,
    SupplyCoord
  }
}
</script>

<template>
  <div id="app">
    <Alerting/>
    <ScaleLine />
    <SupplyCoord/>
  </div>
</template>

<style>
</style>
