<template>
  <div id="app">
    <Alerting/>
    <SupplyCoord/>
  </div>
</template>

<script>
import Alerting from './components/Alerting.vue'
import Tool from './components/Tool.vue'
import SupplyCoord from './components/SupplyCoord.vue'

export default {
  name: 'app',
  components: {
    Alerting,
    Tool,
    SupplyCoord
  }
}
</script>

<style>
</style>
