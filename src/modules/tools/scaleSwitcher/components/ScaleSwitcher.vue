<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import Tool from "../../Tool.vue";
import getters from "../store/gettersScaleSwitcher";
import mutations from "../store/mutationsScaleSwitcher";
/**
 * Tool to switch the scale of the map. Listens to changes of the map's scale and sets the scale to this value.
 */
export default {
    name: "ScaleSwitcher",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/ScaleSwitcher", Object.keys(getters)),
        ...mapGetters("Map", ["scales"]),
        scale: {
            get () {
                return this.$store.state.Map.scale;
            },
            set (value) {
                this.$store.commit("Map/setScale", value);
            }
        }
    },

    /**
     * Lifecycle hook: adds a "close"-Listener to close the tool.
     * @returns {void}
     */
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Map", ["setResolutionByIndex"]),
        ...mapMutations("Tools/ScaleSwitcher", Object.keys(mutations)),

        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when ModelList is migrated
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.$store.state.Tools.ScaleSwitcher.id);

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
                id="scale-switcher"
            >
                <label
                    for="scale-switcher-select"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.scaleSwitcher.label") }}</label>
                <div class="col-md-7 col-sm-7">
                    <select
                        id="scale-switcher-select"
                        v-model="scale"
                        class="font-arial form-control input-sm pull-left"
                        @change="setResolutionByIndex($event.target.selectedIndex)"
                    >
                        <option
                            v-for="(scaleValue, i) in scales"
                            :key="i"
                            :value="scaleValue"
                        >
                            1:{{ scaleValue }}
                        </option>
                    </select>
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
    #scale-switcher-select {
        border: 2px solid @secondary;
    }
</style>
