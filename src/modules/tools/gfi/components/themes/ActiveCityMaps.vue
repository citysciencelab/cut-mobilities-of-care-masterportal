<script>
import beautifyWfsKeys from "../../../../../utils/beautifyWfsKeys.js";
import {isWebLink} from "../../../../../utils/urlHelper.js";

export default {
    name: "ActiveCityMaps",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    methods: {
        beautifyWfsKeys,
        isWebLink,
        /**
         * Checks if the string includes a pipe
         * @param {string} value - string to check
         * @returns {boolean} true | false
         */
        hasPipe: function (value) {
            return value.includes("|");
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
                <td class="bold">
                    {{ beautifyWfsKeys(key) }}
                </td>
                <td v-if="isWebLink(value)">
                    <a
                        :href="value"
                        target="_blank"
                    >Link</a>
                </td>
                <td v-else-if="hasPipe(value)">
                    <p
                        v-for="(splitedValue, splittedKey) in value.split('|')"
                        :key="splittedKey"
                    >
                        {{ splitedValue }}
                    </p>
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

.table > tbody > tr > td {
    padding: 5px 8px;
    font-size: 12px;
    &.bold{
        font-family: @font_family_accent;
    }
}
.gfi-iFrame {
    width: 100%;
    min-height: 40vh;
}

</style>
