<script>
import beautifyWfsKey from "../../../../../utils/beautifyWfsKey.js";
import {isWebLink} from "../../../../../utils/urlHelper.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../../utils/isPhoneNumber.js";

export default {
    name: "Default",
    props: {
        feature: {
            type: Object,
            required: true
        },
        gfiFeatures: {
            type: Array,
            required: false,
            default: function () {
                return [this.feature];
            }
        }
    },
    methods: {
        beautifyWfsKey,
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink
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
                    {{ beautifyWfsKey(key) }}
                </td>
                <td v-if="isWebLink(value)">
                    <a
                        :href="value"
                        target="_blank"
                    >Link</a>
                </td>
                <td v-else-if="isPhoneNumber(value)">
                    <a :href="getPhoneNumberAsWebLink(value)">{{ value }}</a>
                </td>
                <td v-else>
                    {{ value }}
                </td>
            </tr>
        </tbody>
        <tbody v-else-if="typeof feature.getGfiUrl === 'function' && feature.getGfiUrl() !== ''">
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
