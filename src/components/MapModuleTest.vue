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
 * Used during initial implementation, may be discarded later when actual components are connected.
 */
export default {
    name: "MapModuleTest",
    computed: {
        ...mapGetters("Map", data.getterKeys),
        dataList () {
            return data.getterKeys.map(key => {
                if (key === "layers") {
                    return [key, this[key]];
                }

                return [
                    key,
                    this[key] !== null && typeof this[key] === "object" && !Array.isArray(this[key])
                        ? "Object"
                        : JSON.stringify(this[key], null, 2)
                ];
            });
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
                <template v-if="key !== 'layers'">
                    {{ key }}: <span class="wrap-newline">{{ value }}</span>
                </template>
                <template v-else>
                    {{ key }}
                    <ul v-if="value !== null">
                        <li
                            v-for="layerKey in Object.keys(value)"
                            :key="`list-item-layer-${layerKey}`"
                        >
                            Id: {{ layerKey }},
                            Name: {{ value[layerKey].name }}
                            <input
                                :id="`checkbox-layer-${layerKey}`"
                                type="checkbox"
                                :value="value[layerKey].visibility"
                                :checked="value[layerKey].visibility"
                                @click="toggleLayerVisibility(layerKey)"
                            >
                            <label :for="`checkbox-layer-${layerKey}`">{{ value[layerKey].visibility }}</label>
                            <input
                                :id="`opacity-range-${layerKey}`"
                                type="range"
                                name="opacity"
                                min="0"
                                max="1"
                                step="0.01"
                                :value="value[layerKey].opacity"
                                @input="setLayerOpacity({ layerId: layerKey, value: $event.target.value })"
                            >
                            <label for="opacity">Sichtbarkeit {{ value[layerKey].opacity }} / 1.0</label>
                        </li>
                    </ul>
                </template>
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
        max-height: 60%;
        overflow-y: scroll;
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
