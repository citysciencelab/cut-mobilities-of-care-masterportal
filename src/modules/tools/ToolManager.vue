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
    },
    mounted () {
        /** Push the configured attributes to store from all configured tools. */
        this.configuredTools.forEach(configuredTool => this.pushAttributesToStoreElements(configuredTool));

        this.setToolActiveByConfig();
        this.configuredTools.forEach(configuredTool => this.activateByUrlParam(configuredTool?.component?.name));
    },
    methods: {
        ...mapActions("Tools", [
            "pushAttributesToStoreElements",
            "activateByUrlParam",
            "setToolActiveByConfig"
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
