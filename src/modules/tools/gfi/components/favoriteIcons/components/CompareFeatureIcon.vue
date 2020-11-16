<script>
import {mapGetters} from "vuex";
import uniqueId from "../../../../../../utils/uniqueId.js";
import componentExists from "../../../../../../utils/componentExists.js";

export default {
    name: "CompareFeatureIcon",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            featureIsOnCompareList: true,
            olFeature: null
        };
    },
    computed: {
        ...mapGetters("Map", ["visibleLayerListWithChildrenFromGroupLayers"]),

        /**
         * Returns the correct title, depending on whether the feature is on the comparelist or not.
         * @returns {String} Title for the comparelist.
         */
        titleCompareList: function () {
            return this.featureIsOnCompareList ? this.$t("modules.tools.gfi.favoriteIcons.compareFeatureIcon.fromCompareList") : this.$t("modules.tools.gfi.favoriteIcons.compareFeatureIcon.toCompareList");
        }
    },
    watch: {
        feature () {
            this.initialize();
        }
    },
    created () {
        this.initialize();
    },
    methods: {
        componentExists,

        /**
         * Checks if the feature is on the comparelist.
         * Starts to prepare the data and sets up the listener.
         * @param {Object} feature The feature from property
         * @returns {void}
         */
        initialize: function () {
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
            if (this.visibleLayerListWithChildrenFromGroupLayers?.length > 0) {
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
        }
    }
};
</script>

<template>
    <span
        v-if="olFeature && componentExists('compareFeatures')"
        :class="['glyphicon', featureIsOnCompareList ? 'glyphicon-star' : 'glyphicon-star-empty']"
        :title="titleCompareList"
        @click="toogleFeatureToCompareList"
    ></span>
</template>

<style lang="less" scoped>
@color: #fec44f;

.glyphicon-star {
    color: @color;
}
</style>
