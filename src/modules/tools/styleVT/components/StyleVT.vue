<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import Tool from "../../Tool.vue";
import actions from "../store/actionsStyleVT";
import getters from "../store/gettersStyleVT";
import mutations from "../store/mutationsStyleVT";

export default {
    name: "StyleVT",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/StyleVT", Object.keys(getters))
    },
    watch: {
        /**
         * Dispatches the action 'setActive' when the tool should be activated.
         *
         * @param {Boolean} active Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (active) {
            this.setActive({active});
        }
    },
    created () {
        Backbone.Events.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": this.refreshVectorTileLayerList
        });

        if (Radio.request("Parser", "getTreeType") === "light") {
            this.refreshVectorTileLayerList();
        }
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/StyleVT", Object.keys(mutations)),
        ...mapActions("Tools/StyleVT", Object.keys(actions)),
        close () {
            this.setActive({active: false});

            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template>
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
        :initialWidth="initialWidth"
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
                            @change="setLayerModelById($event.target.value)"
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
                        v-if="layerModel"
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
                            @change="triggerStyleUpdate($event.target.value)"
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
