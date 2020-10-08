<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersGfi";
import Mobile from "./templates/Mobile.vue";
import Detached from "./templates/Detached.vue";
import Table from "./templates/Table.vue";
import Attached from "./templates/Attached.vue";
import {omit} from "../../../../utils/objectHelpers";

export default {
    name: "Gfi",
    components: {
        Mobile,
        Detached,
        Table,
        Attached
    },
    data () {
        return {
            // current index of the pagination and so also for the feature in the gfiFeatures
            pagerIndex: 0,
            // key for re-render child(detached) component
            componentKey: false
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
        ...mapGetters("Map", {
            gfiFeatures: "gfiFeatures",
            mapSize: "size"
        }),
        /**
         * Returns the current view type.
         * It only works if the string has the same name as the component (in ./templates).
         * @returns {String} the current view type (Detached or Mobile)
         */
        currentViewType: function () {
            if (this.isMobile) {
                return "Mobile";
            }
            else if (this.desktopType === "attached") {
                return "Attached";
            }
            else if (this.isTable) {
                return "Table";
            }
            return "Detached";
        },
        /**
         * Is visible if there is at least one feature and the gfi is activated.
         * @returns {Boolean} gfi visibility
         */
        isVisible: function () {
            return this.gfiFeatures !== null && this.active;
        },
        /**
         * Returns the feature depending on the pager index.
         * @returns {?Object} - the current feature
         */
        feature: function () {
            if (this.gfiFeatures !== null && Array.isArray(this.gfiFeatures) && this.gfiFeatures.length > 0) {
                return this.gfiFeatures[this.pagerIndex];
            }
            return null;
        }
    },
    watch: {
        /**
         * Whenever active changes and it's false, reset function will call
         * @param {Boolean} newValue - is gfi active
         * @returns {Void}  -
         */
        active: function (newValue) {
            if (!newValue) {
                this.reset();
            }
        },
        /**
         * Whenever feature changes, put it into the store
         * @param {?Object} newValue - the current feature
         * @returns {Void}  -
         */
        feature: function (newValue) {
            this.setCurrentFeature(newValue);
        },
        /**
         * Whenever mapSize changes, component key is changed
         * to force re-render detached component (key-changing).
         * @returns {Void}  -
         */
        mapSize: function () {
            if (this.currentViewType === "Detached") {
                this.componentKey = !this.componentKey;
            }
        }
    },
    beforeUpdate () {
        this.createMappedProperties(this.feature);
    },
    methods: {
        ...mapMutations("Map", ["setGfiFeatures"]),
        ...mapMutations("Tools/Gfi", ["setCurrentFeature"]),
        /**
         * Reset means to set the gfiFeatures to null and the pager index to zero.
         * This closes the gfi window/modal/popover.
         * @returns {Void}  -
         */
        reset: function () {
            this.setGfiFeatures(null);
            this.pagerIndex = 0;
        },
        /**
         * Increases the index for the pagination.
         * @returns {Void}  -
         */
        increasePagerIndex: function () {
            if (this.pagerIndex < this.gfiFeatures.length - 1) {
                this.pagerIndex += 1;
            }
        },
        /**
         * Decreases the index for the pagination.
         * @returns {Void}  -
         */
        decreasePagerIndex: function () {
            if (this.pagerIndex > 0) {
                this.pagerIndex -= 1;
            }
        },
        createMappedProperties: function (feature) {
            if (feature === null || !feature.hasOwnProperty("getProperties") || feature.getProperties() === null) {
                return;
            }

            if (Array.isArray(feature.getProperties())) {
                feature.getProperties().forEach(singleFeature => {
                    this.createMappedProperties(singleFeature);
                });
                return;
            }

            feature.getMappedProperties = () => this.prepareProperties(feature.getProperties(), feature.getAttributesToShow(), this.ignoredKeys);
        },
        /**
         * Checks which properties should be displayed.
         * If all should be displayed, the ignoredKeys omitted.
         * Otherwise the properties are mapped
         * @param {Object} properties - the feature properties
         * @param {Object} mappingObject - "gfiAttributes" from the layer
         * @param {String[]} ignoredKeys - configured in the config.js
         * @returns {Object} prepared properties - mapped by MappingObject or omitted by ignoredKeys
         */
        prepareProperties: function (properties, mappingObject, ignoredKeys) {
            if (mappingObject === "showAll" && Array.isArray(ignoredKeys)) {
                return omit(properties, ignoredKeys, true);
            }
            return this.mapProperties(properties, mappingObject);
        },
        /**
         * Maps the feature properties by the given object.
         * @param {Object} properties - the feature properties
         * @param {Object} mappingObject - "gfiAttributes" from the layer
         * @returns {Object} mapped properties
         */
        mapProperties: function (properties, mappingObject) {
            const mappedProperties = {};

            if (mappingObject === undefined) {
                return mappedProperties;
            }

            Object.keys(mappingObject).forEach(key => {
                if (properties[key] !== undefined) {
                    mappedProperties[mappingObject[key]] = properties[key];
                }
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
            :key="componentKey"
            :feature="feature"
            :gfiFeatures="gfiFeatures"
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
