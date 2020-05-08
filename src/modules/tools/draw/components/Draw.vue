<script>
import {mapGetters, mapMutations} from "vuex";
import Tool from "../../Tool.vue";
import * as constants from "../store/constantsDraw";

export default {
    name: "Draw",
    components: {
        Tool
    },
    props: {
        icon: {
            type: String,
            default: "glyphicon-pencil"
        }
    },
    data () {
        return {
            storePath: this.$store.state.Tools.Draw,
            constants: constants
        };
    },
    computed: {
        ...mapGetters("Tools/Draw", constants.keyStore.getters)
    },
    watch: {
        // Listen on MapEvents on changes on active and do stuff?
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        // TODO: Große Logik mit vielen Dingen --> dann eher action
        ...mapMutations("Tools/Draw", constants.keyStore.mutations),
        close () {
            // TODO: Deactivation of the tool can be moved to the function in the created method when the ModelList is in Vue
            this.active = false;
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.storePath.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};

</script>

<template lang="html">
    <Tool
        :title="$t('modules.tools.draw.title')"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
    >
        <!--
            TODO: Maybe everything needs v-if="active" if above :active is not enough
            TODO: Re-add the CSS classes
        -->
        <template v-slot:toolBody>
            <select
                v-for="option in constants.drawTypeOptions"
                :key="option.id"
            >
                <option
                    :id="option.id"
                    :value="option.value"
                >
                    {{ option.caption }}
                </option>
            </select>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "../../../../variables.less";

    .no-cursor {
        cursor: none;
    }
    .cursor-crosshair {
        cursor: crosshair;
    }
</style>
