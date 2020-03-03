<script>
import Alerting from './components/Alerting.vue'
import SupplyCoord from './components/SupplyCoord.vue'
import ScaleLine from "./components/ScaleLine.vue";
import Title from "./components/Title.vue";

export default {
<<<<<<< HEAD
<<<<<<< HEAD
    name: "App",
    components: {
        Alerting,
=======
    name: 'App',
    components: {
        Alerting,
        Title,
>>>>>>> refactor scaleLine from backbone to vue
        SupplyCoord,
        ScaleLine
    }
};
<<<<<<< HEAD
=======
  name: 'App',
  components: {
    Alerting,
    Title,
    SupplyCoord,
    ScaleLine
  }
}
>>>>>>> update - eslint for vue
=======
>>>>>>> refactor scaleLine from backbone to vue
</script>

<template>
    <div id="app">
        <Alerting />
        <SupplyCoord />
        <ScaleLine />
        <Title />
    </div>
</template>

<style>

</style>
