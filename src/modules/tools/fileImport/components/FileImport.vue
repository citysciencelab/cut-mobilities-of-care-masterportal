<script>
import Tool from "../../Tool.vue";
import getComponent from "../../../../utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersFileImport";
import mutations from "../store/mutationsFileImport";

export default {
    name: "FileImport",
    components: {
        Tool
    },
    data () {
        return {
            dzIsDropHovering: false,
            storePath: this.$store.state.Tools.FileImport
        };
    },
    computed: {
        ...mapGetters("Tools/FileImport", Object.keys(getters)),
        selectedFiletype: {
            get () {
                return this.storePath.selectedFiletype;
            },
            set (value) {
                this.setSelectedFiletype(value);
            }
        },

        dropZoneAdditionalClass: function () {
            return this.dzIsDropHovering ? "dzReady" : "";
        },

        console: () => console
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Tools/FileImport", [
            "importKML",
            "setSelectedFiletype"
        ]),
        ...mapMutations("Tools/FileImport", Object.keys(mutations)),
        onDZDragenter () {
            this.dzIsDropHovering = true;
        },
        onDZDragend () {
            this.dzIsDropHovering = false;
        },
        onDZMouseenter () {
            this.dzIsHovering = true;
        },
        onDZMouseleave () {
            this.dzIsHovering = false;
        },
        onInputChange (e) {
            if (e.target.files !== undefined) {
                this.addFile(e.target.files);
            }
        },
        onDrop (e) {
            this.dzIsDropHovering = false;
            if (e.dataTransfer.files !== undefined) {
                this.addFile(e.dataTransfer.files);
            }
        },
        addFile (files) {
            files.forEach(file => {
                const reader = new FileReader();

                reader.onload = f => {
                    const vectorLayer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");

                    this.importKML({raw: f.target.result, layer: vectorLayer, filename: file.name});
                };

                reader.readAsText(file);
            });
        },
        close () {
            this.setActive(false);
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * opens the draw tool, closes fileImport
         * @pre fileImport is opened
         * @post fileImport is closed, the draw tool is opened
         * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
         * @returns {void}
         */
        openDrawTool () {
            // todo: to select the correct tool in the menu, for now Radio request is used
            const drawToolModel = Radio.request("ModelList", "getModelByAttributes", {id: "draw"});

            // todo: change menu highlighting - this will also close the current tool:
            drawToolModel.collection.setActiveToolsToFalse(drawToolModel);
            drawToolModel.setIsActive(true);

            this.close();
            this.$store.dispatch("Tools/Draw/toggleInteraction", "modify");
            this.$store.dispatch("Tools/setToolActive", {id: "draw", active: true});
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('modules.tools.fileImport.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="tool-file-import"
            >
                <p
                    class="cta"
                    v-html="$t('modules.tools.fileImport.captions.introInfo')"
                >
                </p>
                <p
                    class="cta"
                    v-html="$t('modules.tools.fileImport.captions.introFormats')"
                >
                </p>
                <div
                    class="vh-center-outer-wrapper drop-area-fake"
                    :class="dropZoneAdditionalClass"
                >
                    <div
                        class="vh-center-inner-wrapper"
                    >
                        <p
                            class="caption"
                        >
                            {{ $t("modules.tools.fileImport.captions.dropzone") }}
                        </p>
                    </div>

                    <div
                        class="drop-area"
                        @drop.prevent="onDrop"
                        @dragover.prevent
                        @dragenter.prevent="onDZDragenter"
                        @dragleave="onDZDragend"
                        @mouseenter="onDZMouseenter"
                        @mouseleave="onDZMouseleave"
                    />
                </div>

                <div>
                    <label class="upload-button-wrapper">
                        <input
                            type="file"
                            @change="onInputChange"
                        />
                        {{ $t("modules.tools.fileImport.captions.browse") }}
                    </label>
                </div>

                <div v-if="importedFileNames.length > 0">
                    <div class="h-seperator" />
                    <p class="cta">
                        <label class="successfullyImportedLabel">
                            {{ $t("modules.tools.fileImport.successfullyImportedLabel") }}
                        </label>
                        <ul>
                            <li
                                v-for="(filename, index) in importedFileNames"
                                :key="index"
                            >
                                {{ filename }}
                            </li>
                        </ul>
                    </p>
                    <div class="h-seperator" />
                    <p
                        class="cta introDrawTool"
                        v-html="$t('modules.tools.fileImport.captions.introDrawTool')"
                    >
                    </p>
                    <div>
                        <label class="upload-button-wrapper">
                            <input
                                type="button"
                                @click="openDrawTool"
                            />
                            {{ $t("modules.tools.fileImport.captions.drawTool") }}
                        </label>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    input[type="file"] {
        display: none;
    }
    input[type="button"] {
        display: none;
    }

    .upload-button-wrapper {
        border: 2px solid #DDDDDD;
        background-color:#FFFFFF;
        display: block;
        text-align:center;
        padding: 8px 12px;
        cursor: pointer;
        margin:12px 0 0 0;
        font-size: @font_size_big;
        transition: background 0.25s;

        &:hover {
            background-color:#EEEEEE;
        }
    }

    .cta {
        margin-bottom:12px;
        max-width:300px;
    }
    .drop-area-fake {
        background-color: #FFFFFF;
        border-radius: 12px;
        border: 2px dashed @accent_disabled;
        padding:24px;
        transition: background 0.25s, border-color 0.25s;

        &.dzReady {
            background-color:@accent_hover;
            border-color:transparent;

            p.caption {
                color:#FFFFFF;
            }
        }

        p.caption {
            margin:0;
            text-align:center;
            transition: color 0.35s;
            font-family: @font_family_accent;
            font-size: @font_size_huge;
            color: @accent_disabled;
        }
    }
    .drop-area {
        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        z-index:10;
    }
    .vh-center-outer-wrapper {
        top:0;
        left:0;
        right:0;
        bottom:0;
        text-align:center;
        position:relative;

        &:before {
            content:'';
            display:inline-block;
            height:100%;
            vertical-align:middle;
            margin-right:-0.25em;
        }
    }
    .vh-center-inner-wrapper {
        text-align:left;
        display:inline-block;
        vertical-align:middle;
        position:relative;
    }

    .successfullyImportedLabel {
        font-weight: bold;
    }
    .introDrawTool {
        font-style: italic;
    }
</style>
