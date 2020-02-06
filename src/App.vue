<script>
import Alerting from './components/Alerting.vue'
import Tool from './components/Tool.vue'
import SupplyCoord from './components/SupplyCoord.vue'

export default {
  name: 'App',
  components: {
    Alerting,
    Tool,
    SupplyCoord
  }
}
</script>
<template>
    <div id="app">
        <Alerting />
        <SupplyCoord/>
    </div>
</template>

<style>
</style>
