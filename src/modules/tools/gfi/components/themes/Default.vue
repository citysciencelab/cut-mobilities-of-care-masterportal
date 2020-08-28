<script>
import {upperFirst} from "../../../../../utils/stringHelpers";
import {mapGetters} from "vuex";

export default {
    name: "Default",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters(["ignoredKeys"])
    },
    methods: {
        beautifyKey: function (key) {
            return upperFirst(key).replace(/_/g, " ");
        }
    }
};
</script>

<template>
    <table class="table table-hover">
        <tbody v-if="typeof feature.getMappedProperties === 'function'">
            <tr
                v-for="(value, key) in feature.getMappedProperties()"
                :key="key"
            >
                <th>{{ beautifyKey(key) }}</th>
                <td v-if="typeof value === 'string' && value.startsWith('http', 0)">
                    <a
                        :href="value"
                        target="_blank"
                    >Link</a>
                </td>
                <td v-else>
                    {{ value }}
                </td>
            </tr>
        </tbody>
        <tbody v-else-if="typeof feature.getGfiUrl === 'function' && (typeof feature.isGfiAsNewWindow !== 'function' || !feature.isGfiAsNewWindow())">
            <tr colspan="1">
                <td>
                    <iframe
                        :src="feature.getGfiUrl()"
                        class="gfi-iFrame"
                    >
                    </iframe>
                </td>
            </tr>
        </tbody>
    </table>
</template>


<style lang="less" scoped>
@import "~variables";

th {
    font-family: @font_family_accent;
}
.gfi-iFrame {
    width: 100%;
    min-height: 40vh;
}

</style>
