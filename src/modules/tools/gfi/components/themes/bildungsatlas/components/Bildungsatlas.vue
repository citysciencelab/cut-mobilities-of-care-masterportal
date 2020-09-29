<script>
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator.js";
import BildungsatlasBarchart from "./BildungsatlasBarchart.vue";

export default {
    name: "Bildungsatlas",
    components: {
        BildungsatlasBarchart
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            activeTab: "data",
            gfiSubTheme: ""
        };
    },
    created () {
        const gfiFormat = this.feature.getGfiFormat() || {};

        this.gfiSubTheme = gfiFormat.gfiSubTheme;
    },
    methods: {
        /**
         * checks if a component exists
         * @param {String} name the name of the component to check
         * @returns {Boolean}  true if the component is declared in Bildungsatlas.components
         */
        componentExists (name) {
            return this.$options.components[name] !== null && typeof this.$options.components[name] === "object";
        },
        /**
         * fixes the bildungsatlas data bug: any number delivered as -0.0001 should be 0
         * @param {(String|Number)} value the value to fix
         * @returns {(String|Number)}  the fixed value
         */
        fixDataBug (value) {
            if (value === "-0.0001" || value === -0.0001) {
                return 0;
            }
            return value;
        },
        /**
         * any value of the bildungsatlas needs to have a certain format
         * - a percentage has to have a following %
         * - a value equaling null must be shown as *g.F.
         * - any absolute value should have no decimal places
         * - any relative value should have 2 decimal places
         * @param {(String|Number)} value the value to transform
         * @param {Boolean} relative if true, a percent sign will be attached
         * @param {Number} fixedTo the number of decimal places of the returning value
         * @returns {String}  the value for the bildungsatlas based on the input
         */
        getValueForBildungsatlas (value, relative = false, fixedTo = 2) {
            if (value === null) {
                return "*g.F.";
            }

            // the Number(Number(...).toFixed(...)) is the quickest way to remove zeros at the end of the toFixed string
            return thousandsSeparator(Number(Number(value).toFixed(fixedTo))) + (relative ? "%" : "");
        },
        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {Boolean}  true if the given tab name is active
         */
        isActiveTab (tab) {
            return this.activeTab === tab;
        },
        /**
         * sets the active tab by tab name
         * @param {String} tab the tab name
         * @returns {Void}  -
         */
        setActiveTab (tab) {
            this.activeTab = tab;
        }
    }
};
</script>

<template>
    <div>
        <ul class="nav nav-pills">
            <li :class="{ active: isActiveTab('data') }">
                <a
                    href="#data"
                    @click.prevent="setActiveTab('data')"
                >Daten</a>
            </li>
            <li :class="{ active: isActiveTab('info') }">
                <a
                    href="#info"
                    @click.prevent="setActiveTab('info')"
                >Info</a>
            </li>
        </ul>
        <div class="tab-content">
            <component
                :is="gfiSubTheme"
                v-if="componentExists(gfiSubTheme)"
                :feature="feature"
                :isActiveTab="isActiveTab"
                :getValueForBildungsatlas="getValueForBildungsatlas"
                :fixDataBug="fixDataBug"
            />
        </div>
    </div>
</template>

<style lang="less" scoped>
</style>
