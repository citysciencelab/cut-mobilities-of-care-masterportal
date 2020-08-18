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
        /**
         * Toggles the visibility of the legend
         * @returns {void}
         */
        toggleLegend () {
            this.setShowLegend(!this.showLegend);
        }
    }
};
</script>

<template>
    <ul class="nav navbar-nav">
        <li
            v-if="showLegendInMenu"
            id="legend-menu"
            :class="{ open: showLegend }"
            class="dropdown dropdown-folder"
            @click="toggleLegend"
        >
            <a
                href="#"
                class="dropdown-toggle"
            >
                <span
                    :class="glyphicon"
                    class="glyphicon hidden-sm"
                ></span>
                <span class="menuitem">{{ $t("menu.legend.name") }}</span>
            </a>
        </li>
    </ul>
</template>

<style lang="less" scoped>
    @import "~variables";
    #legend-menu {
        border-right: 1px solid #e5e5e5;
        font-size: 14px;
        float: left;
        cursor: pointer;
    }
</style>
