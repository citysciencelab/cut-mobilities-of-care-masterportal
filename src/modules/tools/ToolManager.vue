<script>
import {mapGetters, mapMutations, mapActions} from "vuex";

export default {
    name: "ToolManager",
    computed: {
        ...mapGetters(["menuConfig"]),
        ...mapGetters("Tools", ["configuredTools"])
    },
    created () {
        this.setConfiguredTools(this.menuConfig);

        // /** Push the configured attributes to store from all configured tools. */
        this.configuredTools.forEach(configuredTool => this.pushAttributesToStoreElements(configuredTool));
    },
    methods: {
        ...mapActions("Tools", [
            "pushAttributesToStoreElements"
        ]),
        ...mapMutations("Tools", [
            "setConfiguredTools"
        ])
    }
};
</script>

<template lang="html">
    <div id="tool-manager">
        <template v-for="tool in configuredTools">
            <component
                :is="tool.component"
                :key="'tool-' + tool.key"
            />
        </template>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";
</style>
