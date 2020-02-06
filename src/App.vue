<script>
import Alerting from './components/Alerting.vue'
import SupplyCoord from './components/SupplyCoord.vue'
import ScaleLine from "./components/ScaleLine.vue";
import Title from "./components/Title.vue";

export default {
<<<<<<< HEAD
    name: "App",
    components: {
        Alerting,
        SupplyCoord,
        ScaleLine
    }
};
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
