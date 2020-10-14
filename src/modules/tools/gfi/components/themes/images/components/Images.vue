<script>
import beautifyWfsKey from "../../../../../../../utils/beautifyWfsKey.js";
import {isWebLink} from "../../../../../../../utils/urlHelper.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../../../../utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../../../../utils/isEmailAddress.js";

export default {
    name: "Images",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            imageLinks: ["bildlink", "link_bild"]
        };
    },
    computed: {
        /**
         * Returns the first value found from the feature properties based on the imageLinks.
         * @return {String} The attribute with image link.
         */
        imageAttribute: function () {
            const firstAttribute = Object.keys(this.feature.getProperties()).find(key => this.imageLinks.includes(key));

            return this.feature.getProperties()[firstAttribute];
        }
    },
    created () {
        this.replacesConfiguredImageLinks();
    },
    methods: {
        beautifyWfsKey,
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,

        /**
         * Replaces  the configured imageLinks from the gfiTheme.params to the imageLinks.
         * @returns {void}
         */
        replacesConfiguredImageLinks: function () {
            const imageLinksAttribute = this.feature.getTheme()?.params?.imageLink;

            if (Array.isArray(imageLinksAttribute)) {
                this.imageLinks = imageLinksAttribute;
            }
            else if (typeof imageLinksAttribute === "string") {
                this.imageLinks = [imageLinksAttribute];
            }
        }
    }
};
</script>

<template>
    <div class="gfi-theme-images">
        <div>
            <a
                v-if="imageAttribute"
                :href="imageAttribute"
                target="_blank"
            >
                <img
                    class="gfi-theme-images-image"
                    :alt="$t('modules.tools.gfi.themes.images.imgAlt')"
                    :src="imageAttribute"
                >
            </a>
        </div>
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
                    <td v-else-if="isEmailAddress(value)">
                        <a :href="`mailto:${value}`">{{ value }}</a>
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
    </div>
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
}
.gfi-theme-images {
    height: 100%;
}
.gfi-theme-images-image {
    margin: auto;
    display: block;
    text-align: center;
    color: black;
}

</style>
