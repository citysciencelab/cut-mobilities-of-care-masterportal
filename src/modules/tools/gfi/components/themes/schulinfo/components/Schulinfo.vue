<script>
import {mapGetters} from "vuex";
import ThemeConfig from "../themeConfig.json";
import {isWebLink} from "../../../../../../../utils/urlHelper.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../../../../utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../../../../utils/isEmailAddress.js";
import uniqueId from "../../../../../../../utils/uniqueId.js";

export default {
    name: "Schulinfo",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            assignedFeatureProperties: [],
            featureIsOnCompareList: false
        };
    },
    computed: {
        ...mapGetters("Map", ["layerList"]),

        /**
         * Returns the olFeature associated with the feature.
         * @returns {ol/Feature} The olFeature
         */
        olFeature: function () {
            const foundLayer = this.layerList.find(layer => layer.get("id") === this.feature.getLayerId());

            return foundLayer.getSource().getFeatures().find(feature => feature.getId() === this.feature.getId());
        },

        /**
         * Returns the correct title, depending on whether the feature is on the comparelist or not.
         * @returns {String} Title for the comparelist.
         */
        titleCompareList: function () {
            return this.featureIsOnCompareList ? "Von der Vergleichsliste entfernen" : "Auf die Vergleichsliste";
        },

        /**
         * Returns the properties of the selected category.
         * @returns {Object[]} The properties for the selected category.
         */
        selectedPropertyAttributes: function () {
            return this.assignedFeatureProperties.find(property => property.isSelected === true)?.attributes;
        }
    },
    watch: {
        feature (value) {
            this.initialize(value);
        }
    },
    created () {
        this.initialize(this.feature);
    },
    methods: {
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
        initialize: function (feature) {
            this.featureIsOnCompareList = this.olFeature.get("isOnCompareList");
            this.assignedFeatureProperties = this.assignFeatureProperties(feature);

            this.olFeature.on("propertychange", this.toggleFeatureIsOnCompareList.bind(this));
        },

        /**
         * Prepares the properties of the feature using the theme configuration.
         * @param {ol/Feature} feature The used feature.
         * @returns {Object[]} The prepared feature properties.
         */
        assignFeatureProperties: function (feature) {
            const topics = JSON.parse(JSON.stringify(ThemeConfig)).themen,
                assignedFeatureProperties = [];

            topics.forEach(topic => {
                const filteredAttributes = [];

                topic.attributes.forEach(attribute => {
                    const value = feature.getProperties()[attribute];
                    // let beautifiedValue;

                    if (value !== undefined) {
                        filteredAttributes.push({
                            attributeName: feature.getAttributesToShow()[attribute],
                            attributeValue: this.beautifyAttribute(value)
                        });
                    }
                });

                topic.attributes = filteredAttributes;

                if (topic.attributes.length > 0) {
                    assignedFeatureProperties.push(topic);
                }
            });

            return assignedFeatureProperties;
        },

        /**
         * Splits the attributeValue by pipe and translates true and false.
         * @param {String} attributeValue - The attribute value.
         * @returns {String[]} The beautified attributeValues.
         */
        beautifyAttribute: function (attributeValue) {
            if (attributeValue.indexOf("|") !== -1) {
                return attributeValue.split("|");
            }
            if (attributeValue === "true" || attributeValue === "ja") {
                return ["Ja"];
            }
            if (attributeValue === "false" || attributeValue === "nein") {
                return ["Nein"];
            }
            return [attributeValue];
        },

        /**
         * Activates the clicked category.
         * @param {Event} event click event
         * @returns {void}
         */
        toggleSelectedCategory: function (event) {
            this.assignedFeatureProperties.forEach(property => {
                if (property.name === event.target.value) {
                    property.isSelected = true;
                }
                else {
                    property.isSelected = false;
                }
            });

            this.assignedFeatureProperties = [...this.assignedFeatureProperties];
        },

        /**
         * Sets the schulwegrouting tool active,
         * hide the gfi window and takes over the school for the routing.
         * @returns {void}
         */
        changeToSchoolrouting: function () {
            Radio.trigger("ModelList", "setModelAttributesById", "schulwegrouting", {isActive: true});
            Radio.trigger("Schulwegrouting", "selectSchool", this.feature.getProperties().schul_id);
            this.$parent.close();
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
    <div class="schulinfo">
        <div class="schulinfo-head">
            <div
                class="btn-group btn-group-sm"
            >
                <button
                    v-for="category in assignedFeatureProperties"
                    :key="category.name"
                    :value="category.name"
                    class="btn btn-default"
                    :class="{'btn-select': category.isSelected}"
                    @click="toggleSelectedCategory"
                >
                    {{ category.name }}
                </button>
                <div class="favorite-mapmarker-container">
                    <span
                        :class="['glyphicon', featureIsOnCompareList ? 'glyphicon-star' : 'glyphicon-star-empty']"
                        :title="titleCompareList"
                        @click="toogleFeatureToCompareList"
                    ></span>
                    <span
                        class="glyphicon glyphicon-map-marker"
                        title="Schule als Ziel übernehmen"
                        @click="changeToSchoolrouting"
                    ></span>
                </div>
            </div>
        </div>
        <div class="schulinfo-content">
            <table class="table table-condensed table-hover">
                <tbody>
                    <tr
                        v-for="attribute in selectedPropertyAttributes"
                        :key="attribute.attributeName"
                        colspan="2"
                    >
                        <td class="bold">
                            {{ attribute.attributeName }}
                        </td>
                        <td>
                            <span
                                v-for="value in attribute.attributeValue"
                                :key="value"
                            >
                                <a
                                    v-if="isWebLink(value)"
                                    :href="value"
                                    target="_blank"
                                >
                                    {{ value }}
                                </a>
                                <a
                                    v-else-if="isPhoneNumber(value)"
                                    :href="getPhoneNumberAsWebLink(value)"
                                >
                                    {{ value }}
                                </a>
                                <a
                                    v-else-if="isEmailAddress(value)"
                                    :href="`mailto:${value}`"
                                >
                                    {{ value }}
                                </a>
                                <span
                                    v-else-if="attribute.attributeName === 'Oberstufenprofil'"
                                >
                                    <b>
                                        {{ value.split(";")[0] }}
                                    </b>
                                    {{ ";" + value.split(";")[1] }}
                                </span>
                                <span v-else>
                                    {{ value }}
                                </span>
                                <br>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<style lang="less" scoped>
@color_1: #fff;
@color_2: #fec44f;
@background_color_1: rgba(227, 227, 227, 0.5);
@background_color_2: rgba(0,0,0,.5);

.schulinfo {
    position: relative;
    .bold {
        td {
            font-weight: bold;
        }
    }
    td {
        font-size: 13px;
    }
    .schulinfo-head {
        padding: 8px 0;
        background-color: @background_color_1;
        position: relative;
    }
    .btn-group-sm {
        font-size: 12px;
        .btn-default {
            margin: 4px;
        }
        padding-right: 64px;
    }
    .favorite-mapmarker-container {
        position: absolute;
        right: 0;
        top: 5px;
        font-size: 0;
    }
    .btn-select {
        color: @color_1;
        background-color: @background_color_2;
    }
    table {
        border-top: 1px solid rgb(229,229,229);
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
        color: @color_2;
    }
}
</style>
