<template>
  <div id="app">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <FooBar msg="Welcome to Your Vue.js App"/>
    <Alerting/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import FooBar from './components/FooBar.vue'
import Alerting from './components/Alerting.vue'

export default {
  name: 'app',
  components: {
    HelloWorld,
    FooBar,
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
