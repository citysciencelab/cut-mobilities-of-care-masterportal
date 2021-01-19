<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import Tool from "../../Tool.vue";
import * as constants from "../store/constantsStyleVT";

export default {
    name: "StyleVT",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/StyleVT", constants.getterKeys)
    },
    created () {
        // TODO(roehlipa): Is this how Vue Components should listen to Events from Backbone?
        Backbone.Events.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": this.refreshVectorTileLayerList
        });

        if (Radio.request("Parser", "getTreeType") === "light") {
            this.refreshVectorTileLayerList();
        }
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/StyleVT", constants.mutationKeys),
        ...mapActions("Tools/StyleVT", constants.actionKeys)
    }
};
</script>

<template>
    <Tool
        :title="name"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <p
                v-if="vectorTileLayerList.length === 0"
                id="tool-styleVT-noStyleableLayers"
            >
                {{ $t("common:modules.tools.styleVT.noStyleableLayers") }}
            </p>
            <div v-else>
                <p>{{ $t("common:modules.tools.styleVT.introText") }}</p>
                <form
                    id="tool-styleVT-styleableLayersAvailable"
                    class="form-horizontal"
                    role="form"
                >
                    <div class="form-group form-group-sm col-md-12 col-sm-12">
                        <label
                            for="tool-styleVT-selectedLayerField"
                            class="range-label"
                        >
                            {{ $t("common:modules.tools.styleVT.theme") }}
                        </label>
                        <select
                            id="tool-styleVT-selectedLayerField"
                            class="form-control input-sm"
                            @change="setLayerModelById"
                        >
                            <option
                                class="pull-left"
                                value=""
                                selected
                            >
                                {{ $t("common:modules.tools.styleVT.chooseTheme") }}
                            </option>
                            <option
                                v-for="vectorTileLayer in vectorTileLayerList"
                                :key="vectorTileLayer.id"
                                class="pull-left"
                                :value="vectorTileLayer.id"
                                :selected="selectedLayerId(vectorTileLayer.id)"
                            >
                                {{ vectorTileLayer.name }}
                            </option>
                        </select>
                    </div>
                    <div
                        v-if="layerModel !== null && layerModel !== undefined"
                        class="form-group form-group-sm col-md-12 col-sm-12"
                    >
                        <label
                            for="tool-styleVT-selectedStyleField"
                            class="style-label"
                        >
                            {{ $t("common:modules.tools.styleVT.style") }}
                        </label>
                        <select
                            id="tool-styleVT-selectedStyleField"
                            class="form-control input-sm"
                            @change="triggerStyleUpdate"
                        >
                            <option
                                v-for="vtStyle in layerModel.get('vtStyles')"
                                :key="vtStyle.id"
                                class="pull-left"
                                :value="vtStyle.id"
                                :selected="selectedStyle(vtStyle.id)"
                            >
                                {{ vtStyle.name }}
                            </option>
                        </select>
                    </div>
                </form>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
@import "~variables";
</style>
