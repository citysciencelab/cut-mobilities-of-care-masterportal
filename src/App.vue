<script>
import MainNav from "./components/MainNav.vue";
import MapRegion from "./components/MapRegion.vue";
import Loader from "./components/Loader.vue";
import MapModuleDebug from "./store/modules/map/MapModuleDebug.vue";
import isDevMode from "./utils/isDevMode";

export default {
    name: "App",
    components: {
        MainNav,
        MapRegion,
        Loader,
        MapModuleDebug
    },
    data: () => ({isDevMode})
};
</script>

<template>
    <div
        id="masterportal-container"
        class="masterportal-container"
    >
        <!-- layout at its heart is two elements - navigation bar and map with elements on it -->
        <MainNav />
        <MapRegion class="map-region" />
        <MapModuleDebug v-if="isDevMode" />
        <!-- keep loader last so it's above it all -->
        <Loader />
    </div>
</template>

<style lang="less" scoped>
    @import "./variables.less";

    #masterportal-container {
        display: flex;
        flex-direction: column;

        position: relative;

        height: 100%;
        width: 100%;

        font-family: @font_family_default;
        font-size: @font_size_default;

        .map-region {
            flex-grow: 1;
        }
    }
</style>
