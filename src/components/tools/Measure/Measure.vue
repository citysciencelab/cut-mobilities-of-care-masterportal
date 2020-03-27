<script>
import storeModule from "./module";
import genericProps from "../genericProps";
import GenericTool from "../GenericTool.vue";

const modulePath = ["tools", "Measure"];

export default {
    name: "Measure",
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
        Measure Tool Content
    </GenericTool>
</template>

<style lang="less" scoped>
    @import "../../../variables.less";
</style>
