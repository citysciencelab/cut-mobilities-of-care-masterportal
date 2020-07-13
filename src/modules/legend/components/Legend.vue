<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersLegend";
import mutations from "../store/mutationsLegend";

export default {
    name: "Legend",
    components: {},
    computed: {
        ...mapGetters("Legend", Object.keys(getters)),
        showLegendInMenu () {
            return Boolean(this.name);
        }
    },
    mounted () {
        this.getLegendConfig();
        console.warn(this.name);
        console.warn(this.showLegendInMenu);
        $(this.$el).insertAfter(document.getElementById("root"));
    },
    methods: {
        ...mapActions("Legend", [
            "getLegendConfig"
        ]),
        ...mapMutations("Legend", Object.keys(mutations)),
        clicked () {
            console.warn("clicked");
        }
    }
};
</script>

<template>
    <ul
        v-if="showLegendInMenu"
        id="Legend"
        @click="clicked"
    >
        <!-- <span class="glyphicon glyphicon-book hidden-sm" /><span>{{ $t("menu.legend") }}</span> -->
        <span class="glyphicon glyphicon-book hidden-sm" /><span>{{ $t(name) }}</span>
    </ul>
</template>

<style lang="less" scoped>
    @import "~variables";
</style>
