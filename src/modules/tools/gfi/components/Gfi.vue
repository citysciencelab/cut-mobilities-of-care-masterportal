<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersGfi";
import Mobile from "./templates/Mobile.vue";
import Detached from "./templates/Detached.vue";
import Table from "./templates/Table.vue";
import Attached from "./templates/Attached.vue";
import {omit} from "../../../../utils/objectHelpers";
import moment from "moment";

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
        // gfiWindow is deprecated
        ...mapGetters({
            isMobile: "mobile",
            gfiWindow: "gfiWindow",
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
            // this.gfiWindow is deprecated
            if (this.gfiWindow) {
                console.warn("Parameter 'gfiWindow' is deprecated. Please use 'Portalconfig.menu.tool.gfi.desktopType' instead.");
            }

            if (this.isMobile) {
                return "Mobile";
            }
            // this.gfiWindow is deprecated
            else if ((this.desktopType || this.gfiWindow)?.toLowerCase() === "attached") {
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
         * @returns {void}
         */
        active: function (newValue) {
            if (!newValue) {
                this.reset();
            }
        },
        /**
         * Whenever feature changes, put it into the store
         * @param {?Object} newValue - the current feature
         * @returns {void}
         */
        feature: function (newValue) {
            this.setCurrentFeature(newValue);
        },
        /**
         * Whenever mapSize changes, component key is changed
         * to force re-render detached component (key-changing).
         * @returns {void}
         */
        mapSize: function () {
            if (this.currentViewType === "Detached") {
                this.componentKey = !this.componentKey;
            }
        },
        /**
         * Whenever gfiFeatures changes, set pagerIndex to zero.
         * @returns {void}
         */
        gfiFeatures: function () {
            this.pagerIndex = 0;
        }
    },
    beforeUpdate () {
        this.createMappedProperties(this.feature);
    },
    methods: {
        ...mapMutations("Map", ["setGfiFeatures"]),
        ...mapMutations("Tools/Gfi", ["setCurrentFeature"]),
        /**
         * Reset means to set the gfiFeatures to null.
         * This closes the gfi window/modal/popover.
         * @returns {void}
         */
        reset: function () {
            this.setGfiFeatures(null);
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
        createMappedProperties: function (feature) {
            if (Array.isArray(feature?.getFeatures())) {
                feature.getFeatures().forEach(singleFeature => {
                    this.createMappedProperties(singleFeature);
                });

            }
            else if (feature?.getProperties() && feature?.getProperties() !== null) {
                feature.getMappedProperties = () => this.prepareProperties(feature.getProperties(), feature.getAttributesToShow(), this.ignoredKeys);
            }
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
         * @param {Object} properties The feature properties.
         * @param {Object} [mappingObject={}] "gfiAttributes" from the layer.
         * @returns {Object} The mapped properties.
         */
        mapProperties: function (properties, mappingObject = {}) {
            const mappedProperties = {};

            Object.keys(mappingObject).forEach(key => {
                let newKey = mappingObject[key],
                    value = this.prepareGfiValue(properties, key);

                if (typeof newKey === "object") {
                    value = this.prepareGfiValueFromObject(key, newKey, properties);
                    newKey = newKey.name;
                }
                if (value && value !== "undefined") {
                    mappedProperties[newKey] = value;
                }
            });

            return mappedProperties;
        },
        /**
         * Derives the gfi value if the value is an object.
         * @param {*} key Key of gfi Attribute.
         * @param {Object} obj Value of gfi attribute.
         * @param {Object} gfi Gfi object.
         * @returns {*} - Prepared Value from gfi.
         */
        prepareGfiValueFromObject: function (key, obj, gfi) {
            const type = obj.hasOwnProperty("type") ? obj.type : "string",
                format = obj.hasOwnProperty("format") ? obj.format : "DD.MM.YYYY HH:mm:ss",
                condition = obj.hasOwnProperty("condition") ? obj.condition : null;
            let preparedValue = this.prepareGfiValue(gfi, key),
                date;

            if (condition) {
                preparedValue = this.getValueFromCondition(key, condition, gfi);
            }
            switch (type) {
                case "date": {
                    date = moment(String(preparedValue));
                    if (date.isValid()) {
                        preparedValue = moment(String(preparedValue)).format(format);
                    }
                    break;
                }
                // default equals to obj.type === "string"
                default: {
                    preparedValue = String(preparedValue);
                }
            }
            if (preparedValue && preparedValue !== "undefined") {
                preparedValue = this.appendSuffix(preparedValue, obj.suffix);
            }

            return preparedValue;
        },
        /**
         * Derives the value from the given condition.
         * @param {String} key Key.
         * @param {String} condition Condition to filter gfi.
         * @param {Object} gfi Gfi object.
         * @returns {*} - Value that matches the given condition.
         */
        getValueFromCondition: function (key, condition, gfi) {
            let valueFromCondition,
                match;

            if (condition === "contains") {
                match = Object.keys(gfi).filter(key2 => {
                    return key2.includes(key);
                })[0];
                valueFromCondition = gfi[match];
            }
            else if (condition === "startsWith") {
                match = Object.keys(gfi).filter(key2 => {
                    return key2.startsWith(key);
                })[0];
                valueFromCondition = gfi[match];
            }
            else if (condition === "endsWith") {
                match = Object.keys(gfi).filter(key2 => {
                    return key2.endsWith(key);
                })[0];
                valueFromCondition = gfi[match];
            }
            else {
                valueFromCondition = gfi[key];
            }

            return valueFromCondition;

        },
        /**
         * Appends a suffix if available.
         * @param {*} value Value to append suffix.
         * @param {*} suffix Suffix
         * @returns {String} - Value with suffix.
         */
        appendSuffix: function (value, suffix) {
            let valueWithSuffix = value;

            if (suffix) {
                valueWithSuffix = String(valueWithSuffix) + " " + suffix;
            }
            return valueWithSuffix;
        },
        /**
         * Returns the value of the given key. Also considers, that the key may be an object path.
         * @param {Object} gfi Gfi object.
         * @param {String} key Key to derive value from.
         * @returns {*} - Value from key.
         */
        prepareGfiValue: function (gfi, key) {
            const isPath = key.startsWith("@");
            let value = gfi[Object.keys(gfi).find(gfiKey => gfiKey.toLowerCase() === key.toLowerCase())];

            if (isPath) {
                value = this.getValueFromPath(gfi, key);
            }
            return value;
        },
        /**
         * Parses the path and returns the value at the position of the path.
         * @param {Object} properties - the feature properties
         * @param {String} key - key that is an object path.
         * @returns {Object|String} value of the path.
         */
        getValueFromPath: function (properties, key) {
            const pathParts = key.substring(1).split(".");
            let value = properties;

            pathParts.forEach(part => {
                value = value ? value[part] : undefined;
            });
            return value;
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
            @close="reset"
        >
            <!-- Slot Content for Footer -->
            <template
                v-if="gfiFeatures.length > 1"
                #footer
            >
                <div class="gfi-footer">
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
                </div>
            </template>
        </component>
    </div>
</template>


<style lang="less">
@import "~variables";

.gfi {
    color: @secondary_contrast;
    .tool-window-vue {
        max-width: 600px;
    }
}
.bold{
    font-weight: bold;
}
.gfi-footer {
        color: #646262;
        font-size: 22px;
         .pager {
            background-color: @secondary;
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

    }

</style>
