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
    <div></div>
</template>

<style lang="less" scoped>
    @import "~variables";

    label {
        margin-top: 7px;
    }
    #scale-switcher-select {
        border: 2px solid @secondary;
    }
</style>
