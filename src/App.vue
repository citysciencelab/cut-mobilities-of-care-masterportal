<script>
// import Alerting from "./modules/Alerting/components/Alerting.vue";
// import SupplyCoord from "./modules/tools/supplyCoord/components/SupplyCoord.vue";
// import ScaleLine from "./modules/scaleLine/components/ScaleLine.vue";
// import Controls from "./modules/controls/Controls.vue";
// // import Tools from "./components/tools/Tools.vue";
// import Title from "./modules/title/components/Title.vue";
// import MapModuleDebug from "./modules/map/components/MapModuleDebug.vue";
// import isDevMode from "./utils/isDevMode";
// import Language from "./modules/language/components/Language.vue";
import MainNav from "./MainNav.vue";
import MapRegion from "./MapRegion.vue";
import MapModuleDebug from "./modules/map/components/MapModuleDebug.vue";
import isDevMode from "./utils/isDevMode";

export default {
    name: "App",
    components: {
        MainNav,
        MapRegion,
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
        <!--
            NOTE currently doesn't work in all browser since vue renders too late;
            after everything goes through vue, this should be usable again
            <Loader />
        -->
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
