<script>
import storeModule from "./module";
import genericProps from "../genericProps";
import GenericTool from "../GenericTool.vue";

const modulePath = ["tools", "SupplyCoord"];

export default {
    name: "SupplyCoord",
    components: {
        GenericTool
    },
    props: {
        ...genericProps
    },
    created () {
        this.$store.registerModule(modulePath, storeModule);
    },
    destroyed () {
        this.$store.unregisterModule(modulePath);
    }
};
</script>

<template>
    <GenericTool :name="name">
        SupplyCoord Tool Content
    </GenericTool>
</template>

<style lang="less" scoped>
    @import "../../../variables.less";
</style>
