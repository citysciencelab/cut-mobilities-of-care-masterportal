<script>
import {Select, DragBox} from "ol/interaction";
import {platformModifierKeyOnly} from "ol/events/condition";
import VectorSource from "ol/source/Vector.js";
import {never} from "ol/events/condition";

import Tool from "../../../../modules/tools/Tool.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersSelectFeatures";
import mutations from "../store/mutationsSelectFeatures";

import {isUrl} from "../../../../utils/urlHelper";

export default {
    name: "SelectFeatures",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/SelectFeatures", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/SelectFeatures", Object.keys(mutations)),

        /**
         * Prepares the properties of a feature for tabular display.
         * @param {object} properties Technical key to display value
         * @param {object} gfiAttributes Technical key to display key
         * @returns {Array.<string[]>} Array of [key,value]-pairs - may be empty
         */
        translateGFI: function (properties, gfiAttributes) {
            // makes links in result list clickable
            Object.entries(properties).forEach(([key, value]) => {
                if (typeof value === "string" && isUrl(value)) {
                    properties[key] = "<a href=" + value + " target=\"_blank\">" + value + "</a>";
                }
            });
            // showAll => just use properties and make key look nice
            if (gfiAttributes === "showAll") {
                return Object
                    .entries(properties)
                    .map(([key, value]) => {
                        if (this.isValidKey(key) && this.isValidValue(value)) {
                            return [this.beautifyKey(key), this.beautifyValue(value)];
                        }
                        return false;
                    })
                    // filter "false" entries that did not pass checks
                    .filter(entry => entry);
            }

            // type object => contains pretty-print instruction for key as value
            if (typeof gfiAttributes === "object") {
                return Object
                    .keys(gfiAttributes)
                    .map(key => [
                        gfiAttributes[key],
                        this.beautifyValue(properties[key] || "")
                    ]);
            }

            // gfiAttributes === "ignore" (or invalid)
            if (gfiAttributes !== "ignore") {
                console.warn(`Layer has invalid gfiAttributes "${gfiAttributes}". Acting as if "ignore" was given.`);
            }

            return [];
        },

        /**
         * Prepares a key for display.
         * e.g. "very_important_field" becomes "Very Important Field"
         * @param {string} str key to beautify
         * @returns {string} beautified key
         */
        beautifyKey: function (str) {
            return str
                .split("_")
                .map(s => s.substring(0, 1).toUpperCase() + s.substring(1))
                .join(" ");
        },

        /**
         * Translates | separators to newlines.
         * @param {string} str string, potentially with separators '|'
         * @returns {string} beautified string
         */
        beautifyValue: function (str) {
            return str
                .split("|")
                .map(s => s.trim())
                .join("<br/>");
        },

        /**
         * helper function: check, if key has a valid value
         * @param {string} key parameter
         * @returns {boolean} desc
         */
        isValidKey: function (key) {
            const ignoredKeys = Config.ignoredKeys ? Config.ignoredKeys : Radio.request("Util", "getIgnoredKeys");

            return ignoredKeys.indexOf(key.toUpperCase()) === -1;
        },

        /**
         * helper function: check, if str has a valid value
         * @param {string} str parameter
         * @returns {boolean} desc
         */
        isValidValue: function (str) {
            return Boolean(str && typeof str === "string" && str.toUpperCase() !== "NULL");
        },

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.SelectFeatures.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="vue-addon"
            >
                {{ $t("additional:modules.tools.vueAddon.content") }}
            </div>
        </template>
    </Tool>
</template>
