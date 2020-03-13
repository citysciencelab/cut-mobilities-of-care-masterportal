<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/modules/map/getters";
import mutations from "../store/modules/map/mutations";
import actions from "../store/modules/map/actions";

const data = {
    getterKeys: Object.keys(getters),
    mutationKeys: Object.keys(mutations),
    actionKeys: Object.keys(actions)
};

/**
 * Example Component to simply view store contents.
 * Used during initial implementation, may be discarded later.
 */
export default {
    name: "MapModuleTest",
    computed: {
        ...mapGetters("Map", data.getterKeys),
        dataList () {
            return data.getterKeys.map(key => [
                key,
                typeof this[key] === "object" && !Array.isArray(this[key]) ? "Object" : JSON.stringify(this[key], null, 2)
            ]);
        }
    },
    mounted () {
        document.getElementsByTagName("body")[0].appendChild(this.$el);
    },
    methods: {
        ...mapMutations("Map", data.mutationKeys),
        ...mapActions("Map", data.actionKeys)
    }
};
</script>

<template>
    <div class="map-module-test">
        <u>DEBUG</u>
        <ul class="contrast">
            <li
                v-for="([key, value], index) in dataList"
                :key="`state-value-${index}`"
            >
                {{ key }}: <span class="wrap-newline">{{ value }}</span>
            </li>
        </ul>
    </div>
</template>

<style lang="less" scoped>
    .map-module-test {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
    }
    .contrast {
        background: #333;
        color: #DDD;
        padding: 25px;
    }
    .wrap-newline {
        white-space: pre;
    }
</style>
