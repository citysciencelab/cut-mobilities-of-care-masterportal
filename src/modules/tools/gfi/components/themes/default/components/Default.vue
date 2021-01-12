<script>
import beautifyKey from "../../../../../../../utils/beautifyKey.js";
import {isWebLink} from "../../../../../../../utils/urlHelper.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../../../../utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../../../../utils/isEmailAddress.js";
import CompareFeatureIcon from "../../../favoriteIcons/components/CompareFeatureIcon.vue";
import RoutingIcon from "../../../favoriteIcons/components/RoutingIcon.vue";

export default {
    name: "Default",
    components: {
        CompareFeatureIcon,
        RoutingIcon
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            imageLinks: ["bildlink", "link_bild"],
            importedComponents: [],
            showFavoriteIcons: true
        };
    },
    computed: {
        /**
         * Returns the first value found from the feature properties based on the imageLinks.
         * @return {String} The attribute with image link.
         */
        imageAttribute: function () {
            const properties = this.feature.getProperties();

            if (properties === null || typeof properties !== "object" || !Array.isArray(this.imageLinks)) {
                return undefined;
            }
            for (const key of this.imageLinks) {
                if (properties.hasOwnProperty(key)) {
                    return properties[key];
                }
            }
            return undefined;
        },

        /**
         * Returns the mimeType of the gfi feature.
         * @returns {String} The mimeType.
         */
        mimeType: function () {
            return this.feature.getMimeType();
        }
    },
    created () {
        this.showFavoriteIcons = this.feature.getTheme()?.params?.hasOwnProperty("showFavoriteIcons") ?
            this.feature.getTheme().params.showFavoriteIcons : this.showFavoriteIcons;

        this.replacesConfiguredImageLinks();
        this.setImportedComponents();
    },
    methods: {
        beautifyKey,
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,

        /**
         * Sets the imported components to importedComponents.
         * @returns {void}
         */
        setImportedComponents: function () {
            Object.keys(this.$options.components).forEach(componentName => {
                if (componentName !== "Default") {
                    this.importedComponents.push(this.$options.components[componentName]);
                }
            });
        },

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
        <div
            v-if="showFavoriteIcons"
            class="favorite-icon-container"
        >
            <template v-for="component in importedComponents">
                <component
                    :is="component"
                    :key="'favorite-' + component.name"
                    :feature="feature"
                />
            </template>
        </div>
        <div>
            <a
                v-if="imageAttribute"
                :href="imageAttribute"
                target="_blank"
            >
                <img
                    class="gfi-theme-images-image"
                    :alt="$t('modules.tools.gfi.themes.default.imgAlt')"
                    :src="imageAttribute"
                >
            </a>
        </div>
        <table class="table table-hover">
            <tbody v-if="typeof feature.getMappedProperties === 'function' && mimeType !== 'text/html'">
                <tr
                    v-for="(value, key) in feature.getMappedProperties()"
                    :key="key"
                >
                    <td class="bold">
                        {{ beautifyKey($t(key)) }}
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
                    <td
                        v-else-if="value.includes('<br>')"
                        v-html="value"
                    >
                    </td>
                    <td v-else>
                        {{ value }}
                    </td>
                </tr>
            </tbody>
            <tbody v-else-if="mimeType === 'text/html'">
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
    height: 100%;
    resize: both;
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
.favorite-icon-container {
    display: flex;
    justify-content: center;
    .glyphicon {
        font-size: 28px;
        padding: 0 2px;
        &:hover {
            cursor: pointer;
            opacity: 0.5;
        }
    }
}
.table {
    margin-bottom: 0px;
}
</style>