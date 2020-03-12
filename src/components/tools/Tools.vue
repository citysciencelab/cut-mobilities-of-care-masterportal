
<script>
import {mapGetters, mapMutations} from "vuex";

import storeModule from "./module";
import {componentMap} from "./data";

/**
 * NOTE
 * The contents of this folder are purely a data-flow demonstration.
 * You can render the contents of Tools.vue as child of the App, but
 * it's only a mock.
 */
export default {
    name: "Tools",
    computed: {
        ...mapGetters(["tools", "mobile"]),
        ...mapGetters("tools", ["openedTools"]),
        activeTools () {
            return this.tools === null
                ? []
                : Object.keys(this.tools)
                    .map(key => componentMap[key]
                        ? {
                            component: componentMap[key],
                            props: this.tools[key],
                            key
                        }
                        : key)
                    .filter(x => typeof x === "string"
                        ? console.warn(`Tool "${x}" not implemented; ignoring key.`)
                        : true);
        }
    },
    mounted () {
        document.getElementById("map").appendChild(this.$el);
    },
    created: function () {
        this.$store.registerModule(["tools"], storeModule);
    },
    methods: {
        ...mapMutations("tools", ["openTool", "closeTool", "toggleTool"]),
        isToolOpen (key) {
            return this.openedTools.has(key);
        }
    }
};
</script>

<template>
    <ul class="ol-unselectable ol-control tool-box">
        <u>Werkzeuge - Mock Datenfluss</u>
        <template v-for="tool in activeTools">
            <li
                v-if="!mobile || !tool.props.onlyDesktop"
                :key="'tool-opener-' + tool.key"
                :class="[isToolOpen(tool.key) ? 'open-tool' : '']"
                @click="toggleTool(tool.key)"
            >
                <span :class="['glyphicon', tool.props.glyphicon]" />
                {{ tool.props.name }}
            </li>
            <component
                :is="tool.component"
                v-if="isToolOpen(tool.key)"
                :key="'tool-instance-' + tool.key"
                v-bind="tool.props"
            />
        </template>
    </ul>
</template>

<style lang="less">
    @import "../../theme.less";

    .open-tool {
        font-weight: bold;
        background: blue;
        color: white;
    }

    .tool-box {
        .glyphicon {
            color: @color_1;
            background-color: @background_color_1;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
            &:hover {
                cursor: pointer;
                opacity: 0.7;
            }
        }
    }
</style>

<style lang="less" scoped>
    @import "../../theme.less";

    .tool-box {
        left: 0px;
        padding: 5px;
        margin: 5px;
        z-index: 1;

        .spaced {
            margin-bottom: 1em;
        }
    }
</style>
