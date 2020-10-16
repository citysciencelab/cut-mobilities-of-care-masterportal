<script>
import {mapGetters} from "vuex";
import beautifyWfsKey from "../../../../../../../utils/beautifyWfsKey.js";
import {isWebLink} from "../../../../../../../utils/urlHelper.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../../../../utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../../../../utils/isEmailAddress.js";
import uniqueId from "../../../../../../../utils/uniqueId.js";

export default {
    name: "Default",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            imageLinks: ["bildlink", "link_bild"],
            featureIsOnCompareList: true,
            olFeature: null
        };
    },
    computed: {
        ...mapGetters("Map", ["clickCoord", "visibleLayerListWithChildrenFromGroupLayers"]),

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
        }
    },
    created () {
        this.initialize();
    },
    methods: {
        beautifyWfsKey,
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,

        /**
         * Checks if the feature is on the comparelist.
         * Starts to prepare the data and sets up the listener.
         * @param {Object} feature The feature from property
         * @returns {void}
         */
        initialize: function () {
            this.replacesConfiguredImageLinks();
            this.fetchOlFeature();

            if (this.olFeature) {
                this.featureIsOnCompareList = this.olFeature.get("isOnCompareList");
                this.olFeature.on("propertychange", this.toggleFeatureIsOnCompareList.bind(this));
            }
        },

        /**
         * Returns the olFeature from layer in the layerList associated with the feature.
         * It also searches in clustered features.
         * @returns {ol/Feature} The olFeature
         */
        fetchOlFeature: function () {
            if (this.visibleLayerListWithChildrenFromGroupLayers.length > 0) {
                const foundLayer = this.visibleLayerListWithChildrenFromGroupLayers.find(layer => layer.get("id") === this.feature.getLayerId());

                if (foundLayer && typeof foundLayer.get("source").getFeatures === "function") {
                    const foundFeatures = foundLayer.get("source").getFeatures();

                    foundFeatures.forEach(feature => {
                        if (feature.get("features")) {
                            feature.get("features").forEach(feat => {
                                if (feat?.getId() === this.feature.getId()) {
                                    this.olFeature = feat;
                                }
                            });
                        }
                        else if (feature?.getId() === this.feature.getId()) {
                            this.olFeature = feature;
                        }
                    });
                }
            }
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
        },

        /**
         * Checks if a component exists.
         * @param {String} componentId - The id from component.
         * @returns {Boolean} The component exists or not.
         */
        componentExist: function (componentId) {
            return Boolean(Radio.request("ModelList", "getModelByAttributes", {id: componentId}));
        },

        /**
         * Indicates whether the feature is on the comparelist.
         * @param {Event} event The given event.
         * @returns {void}
         */
        toggleFeatureIsOnCompareList: function (event) {
            if (event.key === "isOnCompareList") {
                this.featureIsOnCompareList = event.target.get("isOnCompareList");
            }
        },

        /**
         * Triggers the event "addFeatureToList" to the CompareFeatures module to add the feature.
         * @param {Event} event The click event.
         * @returns {void}
         */
        toogleFeatureToCompareList: function (event) {
            if (event?.target?.classList?.contains("glyphicon-star-empty")) {
                const uniqueLayerId = this.feature.getLayerId() + uniqueId("_");

                this.olFeature.set("layerId", uniqueLayerId);
                this.olFeature.set("layerName", this.feature.getTitle());
                Radio.trigger("CompareFeatures", "addFeatureToList", this.olFeature);
            }
            else {
                Radio.trigger("CompareFeatures", "removeFeatureFromList", this.olFeature);
            }
        },

        /**
         * Apply the feature as routing destination in Viomrouting.
         * @returns {void}
         */
        setRoutingDestination: function () {
            Radio.trigger("ModelList", "setModelAttributesById", "routing", {isActive: true});
            Radio.trigger("ViomRouting", "setRoutingDestination", this.clickCoord);
        }
    }
};
</script>

<template>
    <div class="gfi-theme-images">
        <div class="favorite-icon-container">
            <span
                v-if="olFeature && componentExist('compareFeatures')"
                :class="['glyphicon', featureIsOnCompareList ? 'glyphicon-star' : 'glyphicon-star-empty']"
                :title="titleCompareList"
                @click="toogleFeatureToCompareList"
            ></span>
            <span
                v-if="componentExist('routing')"
                class="glyphicon glyphicon-road"
                :title="$t('modules.tools.gfi.themes.default.routingDestination')"
                @click="setRoutingDestination"
            ></span>
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
@color: #fec44f;

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
.favorite-icon-container {
    display: flex;
    justify-content: center;
}
.glyphicon {
        font-size: 28px;
        padding: 0 2px;
        &:hover {
            cursor: pointer;
            opacity: 0.5;
        }
    }
.glyphicon-star {
    color: @color;
}

</style>
