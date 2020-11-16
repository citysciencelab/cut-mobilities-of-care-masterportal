<script>
import {mapGetters} from "vuex";
import componentExists from "../../../../../../utils/componentExists.js";

export default {
    name: "RoutingIcon",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters("Map", ["clickCoord"])
    },
    methods: {
        componentExists,

        /**
         * Apply the feature as routing destination in Viomrouting.
         * @returns {void}
         */
        setRoutingDestination: function () {
            Radio.trigger("ModelList", "setModelAttributesById", "routing", {isActive: true});
            Radio.trigger("ViomRouting", "setRoutingDestination", this.clickCoord);
        }
    }
};
</script>

<template>
    <span
        v-if="componentExists('routing')"
        class="glyphicon glyphicon-road"
        :title="$t('modules.tools.gfi.favoriteIcons.routingicon.routingDestination')"
        @click="setRoutingDestination"
    ></span>
</template>

<style lang="less" scoped>
</style>
