<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersLegend";
import mutations from "../store/mutationsLegend";
import actions from "../store/actionsLegend";

export default {
    name: "LegendMenu",
    components: {},
    computed: {
        ...mapGetters("Legend", Object.keys(getters)),
        showLegendInMenu () {
            return Boolean(this.name);
        }
    },
    mounted () {
        this.getLegendConfig();
        $(this.$el).insertAfter(document.getElementById("root"));
    },
    methods: {
        ...mapActions("Legend", Object.keys(actions)),
        ...mapMutations("Legend", Object.keys(mutations)),
        toggleLegend () {
            this.setShowLegend(!this.showLegend);
        }
    }
};
</script>

<template>
    <div
        v-if="showLegendInMenu"
        id="legend-menu"
        @click="toggleLegend"
    >
        <span
            :class="glyphicon"
            class="glyphicon hidden-sm"
        ></span>
        <span>{{ $t("menu.legend") }}</span>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";
    #legend-menu {
        cursor: pointer;
    }
</style>
