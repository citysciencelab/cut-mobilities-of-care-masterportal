<script>
import {mapGetters, mapActions} from "vuex";
import getComponent from "../../../../utils/getComponent";
import Tool from "../../Tool.vue";
import getters from "../store/gettersLayerAnalysis";

/**
 * Tool to switch the scale of the map. Listens to changes of the map's scale and sets the scale to this value.
 */
export default {
    name: "LayerAnalysis",
    components: {
        Tool
    },
    data () {
        return {
            selected: null
        };
    },
    computed: {
        ...mapGetters("Tools/LayerAnalysis", Object.keys(getters)),
        ...mapGetters("Map", ["layerList"]),
        optionList: {
            get () {
                return Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"});
            }
        }
    },
    watch: {
        selected (layer) {
            if (layer) {
                this.optionList.forEach(option => {
                    option.setIsSelected(layer.get("id") === option.get("id"));
                });
            }
        }
    },

    /**
     * Lifecycle hook: adds a "close"-Listener to close the tool.
     * @returns {void}
     */
    created () {
        const channel = Radio.channel("ModelList");

        channel.on({
            "updatedSelectedLayerList": this.deselect
        });
        this.$on("close", this.close);
    },
    methods: {
        deselect () {
            const selectedWFSLayers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS", isSelected: true});

            if (selectedWFSLayers.length > 1) {
                this.selected = null;
            }
        },
        ...mapActions("Map", ["toggleLayerVisibility"]),
        // ...mapMutations("Tools/ScaleSwitcher", Object.keys(mutations)),

        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when ModelList is migrated
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.$store.state.Tools.LayerAnalysis.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="name"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="layer-analysis"
            >
                <label
                    for="layer-analysis-select"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.layerAnalysis.label") }}</label>
                <div class="col-md-7 col-sm-7">
                    <select
                        id="layer-analysis-select"
                        v-model="selected"
                        class="font-arial form-control input-sm pull-left"
                    >
                        <option
                            v-for="layer in optionList"
                            :key="layer.get('id')"
                            :value="layer"
                        >
                            {{ layer.get("name") }}
                        </option>
                    </select>
                </div>
                <label
                    for="layer-analysis-range"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.layerAnalysis.label") }}</label>
                <div class="col-md-7 col-sm-7">
                    <input
                        id="layer-analysis-range"
                        type="range"
                    >
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";
</style>
