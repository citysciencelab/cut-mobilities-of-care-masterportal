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
        ...mapGetters(["mobile", "uiStyle"])
    },
    mounted () {
        const root = this.uiStyle === "TABLE" ? document.getElementById("table-tools-menu") : document.getElementById("root");

        this.getLegendConfig();
        if (root) {
            if (this.uiStyle === "TABLE") {
                root.append(this.$el);
            }
            else {
                root.parentNode.insertBefore(this.$el, root.nextSibling);
            }
        }
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
    <div :class="{ 'table-tool': uiStyle === 'TABLE'}">
        <ul
            v-if="!mobile && uiStyle !== 'TABLE'"
            id="legend-menu"
            class="nav navbar-nav"
        >
            <li
                v-if="showLegendInMenu"
                :class="{ 'open': showLegend }"
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
                    <span class="menuitem">{{ $t(name) }}</span>
                </a>
            </li>
        </ul>
        <ul
            v-if="mobile"
            id="legend-menu"
            class="list-group mobile"
        >
            <li
                v-if="showLegendInMenu"
                :class="{ open: showLegend }"
                class="list-group-item"
                @click="toggleLegend"
            >
                <div>
                    <span
                        :class="glyphicon"
                        class="glyphicon hidden-sm"
                    ></span>
                    <span class="title">{{ $t(name) }}</span>
                </div>
            </li>
        </ul>
        <a
            v-if="!mobile && uiStyle === 'TABLE'"
            href="#"
            class="dropdown-toggle"
            @click="toggleLegend"
        >
            <span
                :class="glyphicon"
                class="glyphicon hidden-sm"
            ></span>
            <span class="menuitem">{{ $t(name) }}</span>
        </a>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";
    #legend-menu {
        border-right: 1px solid #e5e5e5;
        font-size: 14px;
        cursor: pointer;
        .mobile {
            .list-group-item {
                padding: 12px 5px;
            }
            li {
                font-family: "MasterPortalFont", "Arial Narrow", Arial, sans-serif;
                padding-left: 6px;
                vertical-align: text-bottom;
            }
        }
    }
</style>
