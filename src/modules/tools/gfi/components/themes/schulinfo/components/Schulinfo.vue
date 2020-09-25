<script>
import themeConfig from "../themeConfig.json";
// import {mapGetters, mapActions, mapMutations} from "vuex";
// import getters from "../store/gettersSchulinfo";
// import mutations from "../store/mutationsSchulinfo";

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
            assignedFeatureProperties: []
        };
    },
    computed: {
        // ...mapGetters("Tools/Gfi/Schulinfo", Object.keys(getters)),
        // ...mapGetters("Tools/Gfi/Schulinfo", ["assignedFeatureProperties", "getSelectedProperty"])
    },
    created () {
        // console.log(this.feature);
        // this.feature.on("propertychange", this.toggleStarGlyphicon.bind(this));

        this.assignedFeatureProperties = this.assignFeatureProperties(this.feature);
    },
    // mounted () {
    //     this.getSelectedProperty().attributes.forEach(attribute => {
    //         console.log(attribute);
    //     })
    // },

    methods: {
        // ...mapActions("Tools/Gfi/Schulinfo", [
        //     "assignFeatureProperties",
        //     "toggleSelectedCategory"
        // ]),
        // ...mapMutations("Tools/Gfi/Schulinfo", Object.keys(mutations)),

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

        toggleStarGlyphicon: function (event) {
            if (event.key === "isOnCompareList") {
                const glyphiconElement = this.$("span:nth-child(2)");

                if (event.target.isOnCompareList) {
                    this.highlightStarGlyphicon(glyphiconElement);
                }
                else {
                    this.unhighlighStarGlyphicon(glyphiconElement);
                }
            }
        },

        /**
         * highlights the star glyphicon and sets the title attribute
         * @param {jQuery} glyphiconElement - the glyphicon span element
         * @returns {void}
         */
        highlightStarGlyphicon: function (glyphiconElement) {
            glyphiconElement.addClass("glyphicon-star");
            glyphiconElement.removeClass("glyphicon-star-empty");
            glyphiconElement.attr("title", "Von der Vergleichsliste entfernen");
        },

        /**
         * unhighlights the star glyphicon and sets the title attribute
         * @param {jQuery} glyphiconElement - the glyphicon span element
         * @returns {void}
         */
        unhighlighStarGlyphicon: function (glyphiconElement) {
            glyphiconElement.addClass("glyphicon-star-empty");
            glyphiconElement.removeClass("glyphicon-star");
            glyphiconElement.attr("title", "Auf die Vergleichsliste");
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
                    v-for="category in assignedFeatureProperties"
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
                ></span>
                <span
                    v-if="feature.isOnCompareList"
                    class="glyphicon glyphicon-star pull-right"
                    title="Von der Vergleichsliste entfernen"
                ></span>
                <span
                    v-else
                    class="glyphicon glyphicon-star-empty pull-right"
                    title="Auf die Vergleichsliste"
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
