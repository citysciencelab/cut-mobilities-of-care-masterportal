<script>
import MainNav from "./components/MainNav.vue";
import MapRegion from "./components/MapRegion.vue";
import Loader from "./components/Loader.vue";
import Popup from "./components/Popup.vue";
import Alerting from "./components/Alerting.vue";
import SupplyCoord from "./components/SupplyCoord.vue";
import MapModuleDebug from "./store/modules/map/MapModuleDebug.vue";
import isDevMode from "./utils/isDevMode";

export default {
    name: "App",
    components: {
        MainNav,
        MapRegion,
        Loader,
        Popup,
        Alerting,
        SupplyCoord,
        MapModuleDebug
    },
    data: () => ({isDevMode})
};
</script>

<template>
    <div id="vue-app">
        <!-- layout at its heart is two elements - navigation bar and map with elements on it -->
        <MainNav />
        <MapRegion class="map-region" />
        <!-- elements below this line must be positioned absolutely -->
        <Loader />
        <Popup />
        <Alerting />
        <SupplyCoord />
        <MapModuleDebug v-if="isDevMode" />
    </div>
</template>

<style lang="less" scoped>
    @import "./variables.less";

    #vue-app {
        display: flex;
        flex-direction: column;

        height: 100%;
        width: 100%;

        font-family: @font_family_0;

        .map-region {
            flex-grow: 1;
        }
    }
</style>
