<script>

import BasicDragHandle from "./BasicDragHandle.vue";
import BasicResizeHandle from "./BasicResizeHandle.vue";

export default {
    name: "ToolWindow",
    components: {
        BasicDragHandle,
        BasicResizeHandle
    },
    props: {
        initialWidth: {
            type: Number,
            default: -1,
            required: false
        }
    },
    computed: {
        /**
         * Calculates initial width of sidebar or window.
         * @returns {String}    Width style in px
         */
        initialToolWidth () {
            let pixelWidth = parseFloat(this.initialWidth, 10);

            if (pixelWidth < 0 || isNaN(pixelWidth)) {
                return "auto";
            }

            if (pixelWidth <= 1) {
                pixelWidth = this.width * window.innerWidth;
            }

            return Math.floor(pixelWidth) + "px";
        }
    },
    methods: {
        close () {
            this.$emit("close");
        }
    }
};
</script>

<template>
    <div
        class="tool-window-vue"
        :style="{width: initialToolWidth}"
    >
        <div class="tool-window-heading">
            <slot name="leftOfTitle" />

            <BasicDragHandle
                targetSel=".tool-window-vue"
                class="heading-element flex-grow"
            >
                <p class="tool-window-heading-title">
                    <slot name="title" />
                </p>
            </BasicDragHandle>

            <slot name="rightOfTitle" />

            <div class="heading-element">
                <span
                    class="glyphicon glyphicon-remove"
                    @click="close($event)"
                />
            </div>
        </div>

        <div class="vue-tool-content-body">
            <slot name="body" />
        </div>

        <BasicResizeHandle
            v-for="hPos in ['tl', 'tr', 'br', 'bl']"
            :id="'basic-resize-handle-' + hPos"
            :key="hPos"
            :hPos="hPos"
            targetSel=".tool-window-vue"
            :minW="200"
            :minH="100"
        />
    </div>
</template>

<style lang="less" scoped>

    @color_1: rgb(85, 85, 85);
    @font_family_1: "MasterPortalFont Bold","Arial Narrow",Arial,sans-serif;
    @background_color_1: rgb(255, 255, 255);

    .tool-window-vue {
        background-color: @background_color_1;
        display: block;
        position: absolute;
        padding:0;
        top: 20px;
        right: 20px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
        z-index: 999;
        max-height:72vh;
        overflow: auto;
        min-width: 280px;

        .basic-resize-handle {
            position:absolute;
            width:6px;
            height:6px;
        }
        #basic-resize-handle-tl { top:0px; left:0px; }
        #basic-resize-handle-tr { top:0px; right:0px;}
        #basic-resize-handle-br { bottom:0px; right:0px;}
        #basic-resize-handle-bl { bottom:0px; left:0px;}
    }

    .tool-window-heading{
        padding: 12px 10px 12px 10px;
        border-bottom: 1px solid rgb(229, 229, 229);
        font-family: @font_family_1;
        display:flex;
        flex-direction:row;
        width:100%;

        .heading-element {
            white-space: nowrap;
            color: @color_1;
            font-size: 14px;
            padding: 6px;

            &.flex-grow {
                flex-grow:99;
                overflow: hidden;
            }

            > span {
                &.glyphicon-minus { top: 3px; }
                &:hover {
                    &:not(.win-icon) { opacity: 0.7; cursor: pointer;}
                }
            }
        }
    }

    .tool-window-heading-title {
        margin:0;
        overflow:hidden;
        white-space: nowrap;
    }

    .vue-tool-content-body {
        position: relative;
        height: calc(100% - 58px);
        width: 100%;
        -webkit-overflow-scrolling: touch;
        background-color: @background_color_1;
        overflow: auto;
    }
</style>
