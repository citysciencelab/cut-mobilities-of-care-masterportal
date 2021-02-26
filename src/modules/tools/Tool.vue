<script>
import {mapGetters} from "vuex";
import BasicDragHandle from "../../share-components/BasicDragHandle.vue";
import BasicResizeHandle from "../../share-components/BasicResizeHandle.vue";

export default {
    name: "Tool",
    components: {
        BasicDragHandle,
        BasicResizeHandle
    },
    props: {
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            default: false,
            required: false
        },
        renderToWindow: {
            type: Boolean,
            default: true,
            required: false
        },
        resizableWindow: {
            type: Boolean,
            default: false,
            required: false
        },
        initialWidth: {
            type: Number,
            default: -1,
            required: false
        },
        deactivateGFI: {
            type: Boolean,
            default: true,
            required: false
        }
    },
    data () {
        return {
            isMinified: false
        };
    },
    computed: {
        ...mapGetters(["uiStyle"]),
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
    watch: {
        /**
         * Shows or hides tool when active props changes. Also triggers map update due to change of available
         * space for map if shown in sidebar.
         * @param {boolean} newValue    flag if tool is active
         * @returns {void}
         */
        active: function (newValue) {
            const modelCollection = Radio.request("ModelList", "getCollection"),
                gfiModel = modelCollection ? modelCollection.findWhere({id: "gfi"}) : undefined;

            if (newValue && gfiModel) {
                gfiModel.setIsActive(!this.deactivateGFI);
            }
            else {
                Radio.trigger("ModelList", "toggleDefaultTool");
            }

            this.updateMap();
        }
    },
    methods: {
        /**
         * Minifies tool and emits evnt.
         *  @return {void}
         */
        minifyTool: function () {
            this.isMinified = true;
            this.$emit("toolMinified");
        },
        /**
         * Maximizes tool and emits evnt.
         *  @return {void}
         */
        maximizeTool: function () {
            this.isMinified = false;
            this.$emit("toolMaximized");
        },
        /**
         * Updates the size of the map depending on sidebars visibility
         *  @return {void}
         */
        updateMap () {
            if (this.renderToWindow) {
                return;
            }
            Radio.trigger("Map", "updateSize");
        },
        /**
         * Updates size of map and emits event to parent.
         * @param {Event} event the click event
         * @return {void}
         */
        close (event) {
            this.updateMap();
            // emit event to parent e.g. SupplyCoord (which uses the tool as component and is therefor the parent)
            this.$parent.$emit("close", event);
        }
    }
};
</script>

<template>
    <div
        v-if="active"
        :id="renderToWindow ? '' : 'tool-sidebar-vue'"
        :class="{
            'tool-window-vue': renderToWindow,
            'table-tool-win-all-vue': uiStyle === 'TABLE',
            'is-minified': isMinified
        }"
        :style="{width: initialToolWidth}"
    >
        <BasicResizeHandle
            v-if="resizableWindow && !renderToWindow"
            id="basic-resize-handle-sidebar"
            hPos="l"
            :minW="200"
            targetSel="#tool-sidebar-vue"
            @endResizing="updateMap"
        >
            <div>&#8942;</div>
        </BasicResizeHandle>

        <div class="win-heading">
            <div class="heading-element">
                <span
                    class="glyphicon win-icon"
                    :class="icon"
                />
            </div>

            <div
                v-if="!renderToWindow"
                class="heading-element flex-grow"
            >
                <p class="title">
                    <span>{{ title }}</span>
                </p>
            </div>

            <BasicDragHandle
                v-if="renderToWindow"
                targetSel=".tool-window-vue"
                :marginBottom="resizableWindow ? 25 : 0"
                class="heading-element flex-grow"
            >
                <p class="title">
                    <span>{{ title }}</span>
                </p>
            </BasicDragHandle>

            <div
                v-if="renderToWindow"
                class="heading-element"
            >
                <span
                    v-if="!isMinified"
                    class="glyphicon glyphicon-minus"
                    title="Minimieren"
                    @click="minifyTool"
                />
                <span
                    v-else
                    class="glyphicon glyphicon-plus"
                    title="Maximieren"
                    @click="maximizeTool"
                />
            </div>
            <div class="heading-element">
                <span
                    class="glyphicon glyphicon-remove"
                    @click="close($event)"
                />
            </div>
        </div>

        <div
            id="vue-tool-content-body"
            class="win-body-vue"
        >
            <slot name="toolBody" />
        </div>
        <div v-if="resizableWindow && renderToWindow">
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
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";
    @color_2: rgb(255, 255, 255);
    @font_family_1: "MasterPortalFont Bold","Arial Narrow",Arial,sans-serif;
    @font_family_2: "MasterPortalFont", sans-serif;
    @background_color_1: rgb(255, 255, 255);
    @background_color_2: #e10019;
    @background_color_3: #f2f2f2;
    @background_color_4: #646262;

    #vue-tool-content-body { display:block; }

    .win-heading{
        border-bottom: 1px solid rgb(229, 229, 229);
        font-family: @font_family_1;
        display:flex;
        flex-direction:row;
        width:100%;
        padding-left: 10px;

        .heading-element {
            white-space: nowrap;
            color: @secondary_contrast;
            font-size: 14px;

            &.flex-grow {
                flex-grow:99;
                overflow: hidden;
            }

            > .title {
                color: @secondary_contrast;
                white-space: nowrap;
                font-size: 14px;
                padding-top: 10px;
            }

            > .glyphicon {
                padding: 10px 8px 10px 0px;
            }

            > span {
                &.glyphicon-minus { top: 3px; }
                &:hover {
                    &:not(.win-icon) { opacity: 0.7; cursor: pointer;}
                }
            }
        }
    }

    .tool-window-vue {
        background-color: @background_color_1;
        display: block;
        position: absolute;
        padding:0;
        top: 20px;
        left: 20px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
        z-index: 999;
        min-width: 280px;

        @media (max-width: 400px) {
            right: 20px;
        }

        .basic-resize-handle {
            position:absolute;
            width:6px;
            height:6px;
        }
        #basic-resize-handle-tl { top:0px; left:0px; }
        #basic-resize-handle-tr { top:0px; right:0px;}
        #basic-resize-handle-br { bottom:0px; right:0px;}
        #basic-resize-handle-bl { bottom:0px; left:0px;}

        &.is-minified {
            width:auto !important;
            height:auto !important;

            #vue-tool-content-body { display:none; }
            .win-heading{
                background-color:@background_color_2;
                border-bottom:none;
                overflow: hidden;
            }
        }
    }

    .win-body-vue {
        position: relative;
        padding: @padding;
        height: calc(100% - 58px);
        width: 100%;
        -webkit-overflow-scrolling: touch;
        background-color: @background_color_1;
        overflow: auto;
        max-height:72vh;
        overflow: auto;
    }

    .table-tool-win-all-vue {
        font-family: @font_family_2;
        border-radius: 12px;
        margin-bottom: 30px;
        .win-heading {
            font-family: @font_family_2;
            font-size: 14px;
            background-color: @background_color_4;
            .heading-element {
                > .title {
                    color: @color_2;
                    font-size: 14px;
                }
                > .buttons { color: @color_2; }
                > .glyphicon { color: @color_2; }
            }
        }
        .win-body-vue {
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
            background-color: @background_color_3;
            * { border-radius: 12px; }
        }
    }

    #tool-sidebar-vue {
        background-color: @background_color_1;
        padding:0 0 0 12px;
        height:100%;
    }

    #basic-resize-handle-sidebar{
        position:absolute;
        top:0;
        left:0;
        bottom:0;
        padding:6px;
        transition:background-color 0.25s;
        background-color:#DDDDDD;

        &:hover { background-color:#BBBBBB; }
        &>div {
            position: absolute;
            top:50%;
            margin-top:-8px;
        }
    }


    @media (max-width: 767px) {
        .tool-window { right: 0; }
        #tool-sidebar-vue {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 1050;
            overflow-x: hidden;
            overflow-y: auto;
            margin: 3%;
        }
    }
</style>
