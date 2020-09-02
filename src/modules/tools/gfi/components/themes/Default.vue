<script>
import {upperFirst} from "../../../../../utils/stringHelpers";

export default {
    name: "Default",
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
         * Checks if the string is a phonenumber.
         * Convention: Phone numbers must start with "+49"
         * @param {string} value - string to check
         * @returns {boolean} true | false
         */
        isPhoneNumber: function (value) {
            const regExp = new RegExp(/^\+[0-9]{2}[^a-zA-Z]*/);

            return regExp.test(value);
        },
        /**
         * Edits a phone number to link it
         * @param {string} value - a phone number
         * @returns {string} edited phone number
         */
        editPhoneNumber: function (value) {
            return "tel:" + value.replace(/ /g, "").replace(/-/g, "");
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
                <th>{{ beautify(key) }}</th>
                <td v-if="isLink(value)">
                    <a
                        :href="value"
                        target="_blank"
                    >Link</a>
                </td>
                <td v-else-if="isPhoneNumber(value)">
                    <a :href="editPhoneNumber(value)">{{ value }}</a>
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
