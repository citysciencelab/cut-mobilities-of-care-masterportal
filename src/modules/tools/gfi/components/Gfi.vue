<script>
import {mapGetters} from "vuex";
import getters from "../store/gettersGfi";
import Mobile from "./templates/Mobile.vue";
import Detached from "./templates/Detached.vue";
import Table from "./templates/Table.vue";
import {omit} from "../../../../utils/objectHelpers";

export default {
    name: "Gfi",
    components: {
        Mobile,
        Detached,
        Table
    },
    data () {
        return {
            // current index of the pagination and so also for the feature in the gfiFeatures
            pagerIndex: 0
        };
    },
    computed: {
        ...mapGetters({
            isMobile: "mobile",
            desktopType: "gfiDesktopType",
            isTable: "isTableStyle",
            ignoredKeys: "ignoredKeys"
        }),
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        ...mapGetters("Map", ["gfiFeatures"]),
        /**
         * Returns the current view type.
         * It only works if the string has the same name as the component (in ./templates).
         * @returns {string} the current view type (Detached or Mobile)
         */
        currentViewType: function () {
            if (this.isMobile) {
                return "Mobile";
            }
            else if (this.isTable) {
                return "Table";
            }
            return "Detached";
        },
        /**
         * Is visible if there is at least one feature and the gfi is activated.
         * @returns {boolean} gfi visibility
         */
        isVisible: function () {
            return this.gfiFeatures !== null && this.isActive;
        },
        /**
         * Returns the feature depending on the pager index.
         * @returns {object|null} - the current feature
         */
        feature: function () {
            if (this.gfiFeatures !== null && Array.isArray(this.gfiFeatures) && this.gfiFeatures.length > 0) {
                return this.gfiFeatures[this.pagerIndex];
            }
            return null;
        }
    },
    beforeUpdate () {
        if (this.feature !== null && this.feature.hasOwnProperty("getProperties") && this.feature.getProperties() !== null) {
        //    console.info(this.feature.getProperties());
            const mappedProperties = this.prepareProperties(this.feature.getProperties(), this.feature.getAttributesToShow(), this.ignoredKeys);

            this.feature.getMappedProperties = () => mappedProperties;
        }
    },
    methods: {
        /**
         * Reset means to set the gfiFeatures to null and the pager index to zero.
         * This closes the gfi window/modal/popover.
         * @returns {void}
         */
        reset: function () {
            this.$store.commit("Map/setGfiFeatures", null);
            this.pagerIndex = 0;
        },
        /**
         * Increases the index for the pagination.
         * @returns {void}
         */
        increasePagerIndex: function () {
            if (this.pagerIndex < this.gfiFeatures.length - 1) {
                this.pagerIndex += 1;
            }
        },
        /**
         * Decreases the index for the pagination.
         * @returns {void}
         */
        decreasePagerIndex: function () {
            if (this.pagerIndex > 0) {
                this.pagerIndex -= 1;
            }
        },
        /**
         * Checks which properties should be displayed.
         * If all should be displayed, the ignoredKeys omitted.
         * Otherwise the properties are mapped
         * @param {object} properties - the feature properties
         * @param {object} mappingObject - "gfiAttributes" from the layer
         * @param {string[]} ignoredKeys - configured in the config.js
         * @returns {object} prepared properties - mapped by MappingObject or omitted by ignoredKeys
         */
        prepareProperties: function (properties, mappingObject, ignoredKeys) {
            if (mappingObject === "showAll") {
                return omit(properties, ignoredKeys);
            }
            return this.mapProperties(properties, mappingObject);
        },
        /**
         * Maps the feature properties by the given object.
         * @param {object} properties - the feature properties
         * @param {object} mappingObject - "gfiAttributes" from the layer
         * @returns {object} mapped properties
         */
        mapProperties: function (properties, mappingObject) {
            const mappedProperties = {};

            Object.keys(mappingObject).forEach(key => {
                mappedProperties[mappingObject[key]] = properties[key];
            });

            return mappedProperties;
        }
    }
};
</script>

<template>
    <div
        v-if="isVisible && feature !== null"
        class="gfi"
    >
        <component
            :is="currentViewType"
            :feature="feature"
            @close="reset"
        >
            <!-- Slot Content for Footer -->
            <template
                v-if="gfiFeatures.length > 1"
                #footer
            >
                <div
                    :class="[pagerIndex < 1 ? 'disabled' : '', 'pager-left', 'pager']"
                    @click="decreasePagerIndex"
                >
                    <span class="glyphicon glyphicon-chevron-left"></span>
                </div>
                <div
                    :class="[pagerIndex === gfiFeatures.length - 1 ? 'disabled' : '', 'pager-right', 'pager']"
                    @click="increasePagerIndex"
                >
                    <span class="glyphicon glyphicon-chevron-right"></span>
                </div>
            </template>
        </component>
    </div>
</template>


<style lang="less" scoped>
@import "~variables";

.gfi {
    color: #555555;
}

.pager {
    background: @shadow;
    padding: 6px;
    cursor: pointer;
    width: 50%;
    margin: 0;
}

.pager-left {
    float: left;
    border-right: 1px solid #ddd;
}

.pager-right {
    float: right;
}

.disabled {
    cursor: not-allowed;
    background-color: @primary_inactive_contrast;
    opacity: 0.2;
}

</style>
