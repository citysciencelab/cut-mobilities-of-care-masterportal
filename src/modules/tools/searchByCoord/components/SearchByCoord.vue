<script>
import Tool from "../../Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersSearchByCoord";
import mutations from "../store/mutationsSearchByCoord";

export default {
    name: "SearchByCoord",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/SearchByCoord", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/SearchByCoord", Object.keys(mutations)),

        close () {
            this.setActive(false);

            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.SearchByCoord.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }};
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
                id="search-by-coord"
            >
                <label
                    for="search-by-coord-select"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.searchByCoord.coordinateSystem") }}</label>
                <div class="col-md-7 col-sm-7">
                    <select
                        id="search-by-coord-select"
                        class="font-arial form-control input-sm pull-left"
                        @change="setResolutionByIndex($event.target.selectedIndex)"
                    >
                        <option>
                            choose something
                        </option>
                    </select>
                    <input
                        placeholder="edit me"
                    >
                    <input
                        placeholder="edit me2"
                    >
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";

    label {
        margin-top: 7px;
    }
    input {
        margin-top: 7px;
    }
    #search-by-coord-select {
        border: 2px solid @secondary;
    }
</style>
