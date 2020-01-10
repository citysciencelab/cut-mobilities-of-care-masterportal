<template>
  <div id="app">
    <Alerting/>
  </div>
</template>

<script>
import Alerting from './components/Alerting.vue'

export default {
  name: 'app',
  components: {
    Alerting
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
