<script>
import {mapGetters} from "vuex";

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
        /**
         * Apply the feature as routing destination in Viomrouting.
         * @returns {void}
         */
        setRoutingDestination: function () {
            Radio.trigger("ModelList", "setModelAttributesById", "routing", {isActive: true});
            Radio.trigger("ViomRouting", "setRoutingDestination", this.clickCoord);
        },

        /**
         * Checks if a component exists.
         * @param {String} componentId - The id from component.
         * @returns {Boolean} The component exists or not.
         */
        componentExist: function (componentId) { // todo function auslagern in util
            return Boolean(Radio.request("ModelList", "getModelByAttributes", {id: componentId}));
        }
    }
};
</script>

<template>
    <span
        v-if="componentExist('routing')"
        class="glyphicon glyphicon-road"
        :title="$t('modules.tools.gfi.favoriteIcons.routingicon.routingDestination')"
        @click="setRoutingDestination"
    ></span>
</template>

<style lang="less" scoped>
</style>
