<script>
import {mapGetters} from "vuex";

export default {
    name: "ToolManager",
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

            configPossibilities.forEach(toolsFromConfig => {
                Object
                    .keys(toolsFromConfig)
                    .map(key => {
                        if (this.componentMap[key]) {
                            return {
                                component: this.componentMap[key],
                                props: typeof toolsFromConfig[key] === "object" ? toolsFromConfig[key] : {},
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
    }
};
</script>

<template lang="html">
    <div id="tool-manager">
        <template v-for="(tool) in configuredTools">
            <component
                :is="tool.component"
                :key="'tool-' + tool.key"
                v-bind="tool.props"
            />
        </template>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";
</style>
