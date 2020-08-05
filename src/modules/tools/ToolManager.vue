<script>
import {mapGetters} from "vuex";
import {mapActions} from "vuex";

export default {
    name: "ToolManager",
    data () {
        return {
            /** Path array of possible config locations for tools */
            configPossibilitiesPaths: [
                "configJson.Portalconfig.menu",
                "configJson.Portalconfig.menu.tools.children"
            ]
        };
    },
    computed: {
        ...mapGetters(["menuConfig"]),
        ...mapGetters("Tools", ["componentMap"]),
        /**
         * Filters the configured tools from the two configuration options:
         * "portalconfigs.menu" and "portalconfigs.menu.tools.children" in config.json.
         * @returns {Object[]} The configured Tools.
         */
        configuredTools () {
            const configPossibilities = [this.menuConfig, this.menuConfig.tools.children],
                configuredTools = [];

            configPossibilities.forEach((toolsFromConfig, index) => {
                Object
                    .keys(toolsFromConfig)
                    .map(key => {
                        if (this.componentMap[key]) {
                            return {
                                component: this.componentMap[key],
                                configPath: this.configPossibilitiesPaths[index] + "." + key,
                                key
                            };
                        }
                        return key;
                    })
                    .filter(tool => typeof tool === "object")
                    .forEach(configuredTool => configuredTools.push(configuredTool));
            });

            return configuredTools;
        }
    },
    created () {
        /** Push the configured attributes to store from all configured tools. */
        this.configuredTools.forEach(configuredTool => this.pushAttributesToStoreElements(configuredTool));
    },
    methods: {
        ...mapActions("Tools", [
            "pushAttributesToStoreElements"
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
