<script>
import themeConfig from "../themeConfig.json";
import {mapGetters} from "vuex";

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
            titleForCompareList: null,
            removeFromCompareListTitle: "Von der Vergleichsliste entfernen",
            addToCompareListTitle: "Auf die Vergleichsliste",
            featureIsOnCompareList: false
        };
    },
    computed: {
        ...mapGetters("Map", ["gfiFeatures"]),

        featureProperties: function () {
            return this.feature.getProperties();
        },

        olFeature: function () {
            return this.feature.getOlFeature();
        },

        getAssignedFeatureProperties: function () {
            return this.assignedFeatureProperties;
        },

        getFeatureIsOnCompareList: function () {
            return this.featureIsOnCompareList;
        },

        titleCompareList: function () {
            return this.getFeatureIsOnCompareList ? this.removeFromCompareListTitle : this.addToCompareListTitle;
        }
    },
    created () {
        this.assignedFeatureProperties = this.assignFeatureProperties(this.feature);

        this.featureIsOnCompareList = this.olFeature.get("isOnCompareList");
        this.olFeature.on("propertychange", this.toggleFeatureIsOnCompareList.bind(this));
    },

    methods: {
        toggleFeatureIsOnCompareList: function (event) {
            if (event.key === "isOnCompareList") {
                this.featureIsOnCompareList = event.target.get("isOnCompareList");
            }
        },

        assignFeatureProperties: (feature) => {
            const topics = JSON.parse(JSON.stringify(themeConfig)).themen,
                assignedFeatureProperties = [];

            topics.forEach(topic => {
                topic.attributes = Object.entries(feature.getProperties())
                    .filter(([key]) => topic.attributes.includes(key))
                    .map(([key, value]) => {
                        return {attributeName: key,
                            attributeValue: value
                        };
                    });

                if (topic.attributes.length > 0) {
                    assignedFeatureProperties.push(topic);
                }
            });

            return assignedFeatureProperties;
        },

        toggleSelectedCategory: function (event) {
            const properties = this.assignedFeatureProperties,
                propertyToSelect = properties.find(property => property.name === event.target.value);

            properties.forEach(property => {
                property.isSelected = false;
            });
            propertyToSelect.isSelected = true;

            // event.target.parentNode.children.forEach(child => child.classList.remove("btn-select"));
            // event.target.classList.add("btn-select");
        },

        selectedProperty: (assignedFeatureProperties) => {
            return assignedFeatureProperties.find(property => property.isSelected === true);
        },

        /**
         * Sets the schulwegrouting tool active,
         * hide the gfi window and takes over the school for the routing
         * @returns {void}
         */
        takeRoute: function () {
            Radio.trigger("ModelList", "setModelAttributesById", "schulwegrouting", {isActive: true});
            this.$parent.close();
            Radio.trigger("Schulwegrouting", "selectSchool", this.featureProperties.schul_id);
        },

        /**
         * Triggers the event "addFeatureToList"
         * to the CompareFeatures module to add the feature
         * @param {Event} event todo
         * @returns {void}
         */
        toogleFeatureToCompareList: function (event) {
            if (event.target.classList.contains("glyphicon-star-empty")) {
                const uniquelayerId = this.feature.getLayerId() + Radio.request("Util", "uniqueId", "_"); // todo remove Radio

                this.olFeature.set("layerId", uniquelayerId);
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
        <div class="schulinfo-head row">
            <div
                class="btn-group btn-group-sm col-xs-9"
            >
                <button
                    v-for="category in getAssignedFeatureProperties"
                    :key="category.name"
                    :value="category.name"
                    class="btn btn-default"
                    :class="{'btn-select': category.isSelected}"
                    @click="toggleSelectedCategory"
                >
                    {{ category.name }}
                </button>
            </div>
            <div class="col-xs-3">
                <span
                    class="glyphicon glyphicon-map-marker pull-right"
                    title="Schule als Ziel übernehmen"
                    @click="takeRoute"
                ></span>
                <span
                    :class="['glyphicon', getFeatureIsOnCompareList ? 'glyphicon-star' : 'glyphicon-star-empty', 'pull-right']"
                    :title="titleCompareList"
                    @click="toogleFeatureToCompareList"
                ></span>
            </div>
        </div>
        <div class="schulinfo-content row">
            <table class="table table-condensed table-hover">
                <tbody>
                    <tr
                        v-for="attribute in selectedProperty(assignedFeatureProperties).attributes"
                        :key="attribute.attributeName"
                        colspan="2"
                    >
                        <td class="bold">
                            {{ attribute.attributeName }}
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
    .schulinfo-head {
        padding: 8px 0;
        background-color: @background_color_1;
    }
    .btn-group-sm {
        .btn-default {
            margin: 4px;
        }
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
@media (min-width: 768px) {
    .schulinfo {
        width: 100%;
        height: 40vh;
    }
}
</style>
