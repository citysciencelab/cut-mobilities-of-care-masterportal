<script>
import {upperFirst} from "../../../../../utils/stringHelpers";

export default {
    name: "ActiveCityMaps",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    methods: {
        /**
         * Beautifies a string by always uppercase the first letter and replacing all underscores by spaces.
         * @param {string} value - string to beautify
         * @returns {string} uppercased value
         */
        beautify: function (value) {
            return upperFirst(value).replace(/_/g, " ");
        },
        /**
         * Checks if the string is a link.
         * @param {string} value - string to check
         * @returns {boolean} true | false
         */
        isLink: function (value) {
            const regExp = new RegExp(/\b(https?|ftp|file)/);

            return regExp.test(value);
        },
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
                    {{ beautify(key) }}
                </td>
                <td v-if="isLink(value)">
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
