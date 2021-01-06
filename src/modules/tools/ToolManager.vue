<script>
import {mapGetters, mapMutations, mapActions} from "vuex";

export default {
    name: "ToolManager",
    props: {
        showInSidebar: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    computed: {
        ...mapGetters(["menuConfig"]),
        ...mapGetters("Tools", ["configuredTools"]),
        toolsInSidebar: function () {
            const res = {};

            this.configuredTools.forEach(tool => {
                res[tool.key] = this.menuConfig.tools.children[tool.key].renderToWindow === false;
            });

            return res;
        }
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
    <div class="tool-manager">
        <template v-for="tool in configuredTools">
            <component
                :is="tool.component"
                v-if="toolsInSidebar[tool.key] === showInSidebar"
                :key="'tool-' + tool.key"
            />
        </template>
    </div>
</template>
